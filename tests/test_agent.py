"""Offline test suite for AgriSense-X Crop Stress Telemetry & Advisory Agent.

Verifies:
1. Core ReAct loop execution without external API keys.
2. Safe calculator execution & boundary safety.
3. Data query tool over datasets.
4. Soil trend analyzer & stress index engine.
5. Weather risk & wash-off evaluator.
6. Agronomic dosage calculator (Urea, DAP, MOP & water).
7. Regional multilingual advisory generator across Indian languages.
8. Standard judging contract schema compliance (--json mode).
"""

import json
import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from agent.core import ReActAgent
from agent.llm import LLMClient
from tools.calculator import SafeCalculator
from tools.data_query import DataQueryTool
from tools.dosage_calculator import DosageCalculatorTool
from tools.regional_advisor import RegionalAdvisorTool
from tools.soil_analyzer import SoilAnalyzerTool
from tools.weather_tool import WeatherRiskTool
from tools import registry


def test_safe_calculator():
    calc = SafeCalculator()
    res1 = calc.run("25.5 * 4 + 10")
    assert "112" in str(res1)

    res_div0 = calc.run("100 / 0")
    assert "error" in str(res_div0).lower() or "division by zero" in str(res_div0).lower()


def test_data_query_tool():
    tool = DataQueryTool()
    # Test listing files
    list_res = tool.run(action="list_files")
    assert "files" in list_res
    assert len(list_res["files"]) > 0

    # Test reading crop recommendations
    read_res = tool.run(action="read_file", filename="crop_recommendation.csv", limit=5)
    assert read_res.get("status") == "success"
    assert len(read_res.get("rows", [])) > 0


def test_soil_analyzer_stress_detection():
    analyzer = SoilAnalyzerTool()
    # Test with tomato telemetry under moderate drought
    res = analyzer.run(
        crop="tomato",
        readings={"moisture": 32.0, "N": 45.0, "P": 18.0, "K": 35.0, "ph": 6.2, "temperature": 31.0}
    )
    assert res.get("status") == "success"
    assert res.get("crop") == "tomato"
    assert "stress_metrics" in res
    metrics = res["stress_metrics"]
    assert "stress_index" in metrics
    assert metrics.get("stress_level") in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "stress_breakdown" in metrics
    assert "moisture" in metrics["stress_breakdown"]


def test_weather_risk_analyzer():
    weather = WeatherRiskTool()
    res = weather.run(location="Karnal, Haryana", lookahead_days=3)
    assert res.get("status") == "success"
    assert "rainfall_risk_level" in res
    assert "wash_off_danger" in res
    assert "forecast_period_days" in res
    assert res["rainfall_risk_level"] in ["NONE", "LOW", "MODERATE", "HIGH", "CRITICAL", "SEVERE"]


def test_dosage_calculator_agronomics():
    calc = DosageCalculatorTool()
    res = calc.run(
        crop="rice",
        soil_readings={"N": 45, "P": 25, "K": 30, "moisture": 25.0},
        field_size_acres=2.0,
        wash_off_danger=False
    )
    assert res.get("status") == "success"
    assert "fertilizer_dosage" in res
    assert "irrigation_dosage" in res
    fert = res["fertilizer_dosage"]
    assert fert["per_acre"]["urea_kg"] > 0
    assert fert["per_acre"]["dap_kg"] > 0

    irrig = res["irrigation_dosage"]
    assert irrig["total_water_liters"] > 0
    assert irrig["net_irrigation_depth_mm"] > 0


def test_regional_advisor_multilingual():
    advisor = RegionalAdvisorTool()
    languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"]

    for lang in languages:
        adv = advisor.run(
            language=lang,
            crop="tomato",
            stress_level="HIGH",
            wash_off=False
        )
        assert adv.get("status") == "success"
        assert adv.get("language") == lang
        assert "advisory" in adv
        assert "headline" in adv["advisory"]
        assert "action_today" in adv["advisory"]
        assert "audio_voice_script" in adv["advisory"]


def test_react_agent_offline_loop():
    agent = ReActAgent(
        llm_client=LLMClient(),
        tool_registry=registry,
        max_iterations=8,
        verbose=False
    )
    res = agent.run("Analyze 7 days soil trends for rice in Hindi")
    assert res["status"] == "success"
    assert res["iterations_used"] >= 1
    assert res["final_answer"] is not None
    assert len(res["react_steps"]) > 0


def test_judging_contract_compliance():
    agent = ReActAgent(
        llm_client=LLMClient(),
        tool_registry=registry,
        max_iterations=8,
        verbose=False
    )
    payload = {
        "crop": "tomato",
        "readings": {
            "moisture": 28.5,
            "N": 42.0,
            "P": 19.0,
            "K": 32.0,
            "ph": 6.4,
            "temperature": 32.0
        },
        "language": "Tamil"
    }
    result = agent.run_json_contract(payload)

    # Validate mandatory contract keys
    required_keys = [
        "crop",
        "stress_level",
        "stress_index",
        "trend_summary",
        "weather_risk",
        "recommendations",
        "regional_advisory",
        "react_metadata"
    ]
    for key in required_keys:
        assert key in result, f"Missing judging contract key: {key}"

    assert result["stress_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert isinstance(result["stress_index"], (int, float))
    assert "water_dosage" in result["recommendations"]
    assert "fertilizer_dosage" in result["recommendations"]
    assert result["regional_advisory"]["language"] == "Tamil"
    assert "iterations_used" in result["react_metadata"]
