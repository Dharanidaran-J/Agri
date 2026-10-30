"""System prompt builder and message formatting for the ReAct Agent."""

import json
from typing import Any, Dict, List, Optional
from config import AGENT_ROLE, MAX_ITERATIONS, SUPPORTED_LANGUAGES


class PromptBuilder:
    """Constructs system and user prompts for the ReAct cycle."""

    def __init__(self, tool_names: List[str], tool_descriptions: str):
        self.tool_names = tool_names
        self.tool_descriptions = tool_descriptions

    def build_system_prompt(self, user_role: Optional[str] = None) -> str:
        role = user_role or AGENT_ROLE
        tools_list_str = ", ".join(self.tool_names)
        lang_list_str = ", ".join(SUPPORTED_LANGUAGES.keys())

        return f"""{role}

You operate strictly using the ReAct (Reasoning + Acting) loop to deliver reliable, telemetry-driven farm advisories.

## AVAILABLE TOOLS:
{self.tool_descriptions}

## MANDATORY REACT FORMAT:
When responding, you MUST use the following format:

Question: The input query or telemetry readings
Thought: Your step-by-step reasoning about what telemetry or agronomic data is needed next.
Action: [The exact name of one tool from: {tools_list_str}]
Action Input: {{"param1": "value1", "param2": "value2"}}
Observation: [The result returned by the tool]

... (Repeat Thought -> Action -> Action Input -> Observation as needed, up to {MAX_ITERATIONS} steps)

Thought: I have synthesized the 7-day soil trends, assessed rainfall/weather risk, calculated exact fertilizer and water dosages, and generated the regional advisory.
Final Answer: [Your final detailed response or JSON contract]

## GUIDELINES FOR AGRI ADVISORY:
1. Always analyze 7 days of soil trends first (using 'soil_analyzer') to identify depletion velocity and stress index.
2. Always check rainfall risk with 'weather_tool' to avoid fertilizer wash-off hazards and deduct expected rain from irrigation.
3. Compute exact fertilizer (Urea/DAP/MOP) and water dosage with 'dosage_calculator'.
4. Format farmer advice in regional languages ({lang_list_str}) with 'regional_advisor'.
5. Repeat Guard: Never repeat the exact same tool call with the same arguments. If a tool returns sufficient data, move forward.
6. When answering in automated judging mode (--json), the Final Answer MUST be a clean, valid JSON object conforming to the judging contract.
"""

    def build_judging_contract_instructions(self) -> str:
        return """
When invoked with `--json`, your `Final Answer` MUST be a single parseable JSON object matching this schema:
```json
{
  "crop": "string",
  "stress_level": "LOW|MODERATE|HIGH|CRITICAL",
  "stress_index": 0-100,
  "trend_summary": "7-day trend findings",
  "weather_risk": {
    "rainfall_risk": "LOW|MODERATE|HIGH",
    "forecast_summary": "string",
    "wash_off_danger": false
  },
  "recommendations": {
    "water_dosage": {
      "net_depth_mm": 0.0,
      "liters_per_acre": 0.0,
      "delivery_method": "string"
    },
    "fertilizer_dosage": {
      "urea_kg_acre": 0.0,
      "dap_kg_acre": 0.0,
      "mop_kg_acre": 0.0,
      "application_timing": "string"
    }
  },
  "regional_advisory": {
    "language": "Hindi|English|...",
    "headline": "string",
    "farmer_action_steps": ["step 1", "step 2"],
    "voice_script": "string"
  }
}
```
"""
