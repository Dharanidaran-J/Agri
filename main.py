"""Main entry point for AgentX Crop Stress Telemetry & Advisory.

Supports:
1) Judging Contract: python main.py --json '{"crop": "rice", "readings": {...}, "language": "Hindi"}'
2) CLI Query:        python main.py "Analyze 7-day soil trends for field 1 with cotton in Tamil"
3) Web UI Server:    python main.py --serve --port 5000
"""

import argparse
import io
import json
import os
import re
import sys

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    if hasattr(sys.stdout, "buffer"):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "buffer"):
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
from agent.core import ReActAgent
from agent.llm import LLMClient
from tools import registry


BANNER = """
========================================================================
   🌾 AGRISENSE-X: Crop Stress Telemetry & Regional Farm Advisory
            [AgentX Hackathon Starter - ReAct Engine]
========================================================================
"""


def main():
    parser = argparse.ArgumentParser(
        description="AgriSense-X: Crop Stress Telemetry & Farm Advisory Agent"
    )
    parser.add_argument(
        "query",
        nargs="?",
        default=None,
        help="Natural language query describing the farm situation or field."
    )
    parser.add_argument(
        "--json",
        dest="json_input",
        metavar="JSON_STRING",
        help="Judging contract input mode: pass JSON payload string to get standardized JSON output."
    )
    parser.add_argument(
        "--field",
        dest="field_id",
        default=None,
        help="Preset field ID to inspect (e.g. FIELD_01_RICE, FIELD_02_MAIZE, FIELD_03_COTTON)."
    )
    parser.add_argument(
        "--crop",
        dest="crop",
        default="rice",
        help="Target crop name (e.g. rice, maize, cotton, chickpea)."
    )
    parser.add_argument(
        "--lang",
        dest="language",
        default="English",
        help="Advisory language (English, Hindi, Telugu, Tamil, Marathi, Punjabi, Gujarati, Kannada, Bengali)."
    )
    parser.add_argument(
        "--serve",
        "--web",
        dest="serve",
        action="store_true",
        help="Launch the interactive Hackathon Web UI Dashboard."
    )
    parser.add_argument(
        "--port",
        dest="port",
        type=int,
        default=5000,
        help="Port to run web server on (default: 5000)."
    )
    parser.add_argument(
        "--max-steps",
        dest="max_steps",
        type=int,
        default=10,
        help="Step cap for ReAct loop (default: 10)."
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress intermediate step printouts."
    )

    args = parser.parse_args()

    # 1. Web UI Mode
    if args.serve:
        print(BANNER)
        print(f"🚀 Starting AgriSense-X Web Dashboard on http://127.0.0.1:{args.port} ...")
        from web_app import create_app
        app = create_app()
        app.run(host="0.0.0.0", port=args.port, debug=False)
        return

    # 2. Judging Contract Mode (--json)
    if args.json_input:
        raw_val = args.json_input.strip()
        payload = None

        # Support reading from stdin if '-'
        if raw_val == "-":
            raw_val = sys.stdin.read().strip()

        # Support @filename.json
        if raw_val.startswith("@") and os.path.exists(raw_val[1:]):
            with open(raw_val[1:], "r", encoding="utf-8") as f:
                payload = json.load(f)
        elif os.path.exists(raw_val):
            with open(raw_val, "r", encoding="utf-8") as f:
                payload = json.load(f)
        else:
            cleaned = raw_val.strip()
            if (cleaned.startswith("'") and cleaned.endswith("'")) or (cleaned.startswith('"') and cleaned.endswith('"')):
                cleaned = cleaned[1:-1].strip()

            # 1. Try direct JSON parsing
            try:
                payload = json.loads(cleaned)
            except Exception:
                # 2. Strip Windows PowerShell backslash escapes (\: or \")
                s = cleaned.replace('\\"', '"').replace('\\', '')
                try:
                    payload = json.loads(s)
                except Exception:
                    try:
                        import ast
                        payload = ast.literal_eval(s)
                    except Exception:
                        try:
                            # 3. Repair unquoted keys and unquoted word values
                            repaired = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', s)
                            repaired = re.sub(r':\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])', r': "\1"\2', repaired)
                            repaired = repaired.replace("'", '"')
                            payload = json.loads(repaired)
                        except Exception as e:
                            err_obj = {
                                "status": "error",
                                "error": f"Invalid JSON passed to --json: {str(e)}",
                                "received": raw_val
                            }
                            print(json.dumps(err_obj, indent=2))
                            sys.exit(1)

        agent = ReActAgent(
            llm_client=LLMClient(),
            tool_registry=registry,
            max_iterations=args.max_steps,
            verbose=False
        )
        contract_result = agent.run_json_contract(payload)
        # Print pure JSON for automated judging evaluation
        print(json.dumps(contract_result, indent=2, ensure_ascii=False))
        return

    # 3. Interactive / CLI Query Mode
    print(BANNER)

    query = args.query
    context = {}

    if not query:
        field = args.field_id or "FIELD_01_RICE"
        query = (
            f"Analyze 7 days of soil trends for {field} growing {args.crop}. "
            f"Check rainfall risk with the weather tool, compute exact fertilizer (Urea/DAP/MOP) "
            f"and irrigation dosage, and generate an actionable advisory in {args.language}."
        )
        context = {
            "field_id": field,
            "crop": args.crop,
            "language": args.language
        }

    agent = ReActAgent(
        llm_client=LLMClient(),
        tool_registry=registry,
        max_iterations=args.max_steps,
        verbose=not args.quiet
    )

    result = agent.run(query, context=context)

    print("\n" + "=" * 72)
    print("📋 [AGRISENSE-X FINAL FARM ADVISORY]")
    print("=" * 72)
    print(result.get("final_answer", "No response generated."))
    print("=" * 72)
    print(f"⏱️  Duration: {result.get('duration_seconds')}s | Steps Used: {result.get('iterations_used')}/{args.max_steps} | Repeat Guard: {result.get('repeat_guard_triggered')}")
    print("========================================================================\n")


if __name__ == "__main__":
    main()
