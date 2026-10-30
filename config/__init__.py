"""Configuration settings for Crop Stress Telemetry & Advisory Agent (AgentX)."""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = os.getenv("DATA_DIR", str(BASE_DIR / "data"))
CROP_DATASET_PATH = os.path.join(DATA_DIR, "crop_recommendation.csv")
BENCHMARKS_PATH = os.path.join(DATA_DIR, "crop_benchmarks.json")
TELEMETRY_PATH = os.path.join(DATA_DIR, "telemetry_7days.csv")

# Agent ReAct Settings
MAX_ITERATIONS = int(os.getenv("MAX_ITERATIONS", "10"))
STEP_TIMEOUT_SECONDS = int(os.getenv("STEP_TIMEOUT_SECONDS", "30"))
TEMPERATURE = float(os.getenv("AGENT_TEMPERATURE", "0.2"))

# Models (Gemini / Groq / OpenAI)
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gemini-2.5-flash")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Supported Regional Languages
SUPPORTED_LANGUAGES = {
    "English": "en",
    "Hindi": "hi",
    "Telugu": "te",
    "Tamil": "ta",
    "Marathi": "mr",
    "Punjabi": "pa",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Bengali": "bn"
}

# Theme Role Description
AGENT_ROLE = (
    "You are AgriSense-X, an elite Agricultural Telemetry & Crop Stress Agronomist Agent. "
    "Your mission is to take sensor telemetry readings, analyze 7-day soil trends, assess rainfall risk "
    "with weather forecast tools, compute precision fertilizer & irrigation dosages, and produce "
    "clear, actionable farm advisories in regional languages and English."
)
