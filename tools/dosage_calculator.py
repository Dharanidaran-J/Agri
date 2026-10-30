"""Fertilizer and water dosage computation tool for precision agriculture."""

import json
import os
from typing import Any, Dict, Optional
from config import BENCHMARKS_PATH
from tools import BaseTool


class DosageCalculatorTool(BaseTool):
    """Computes exact chemical fertilizer (Urea/DAP/MOP) and water irrigation dosage per acre."""

    name = "dosage_calculator"
    description = (
        "Calculate exact fertilizer dosage (Urea, DAP, MOP in kg/acre) and irrigation volume (liters/acre and mm depth) "
        "tailored to crop, current soil N-P-K, moisture deficit, and weather risk. "
        "Input: {'crop': 'rice', 'soil_readings': {'N': 46, 'P': 36, 'K': 35, 'moisture': 20.0}, 'field_size_acres': 1.0, 'expected_rain_mm': 0.0, 'wash_off_danger': false}"
    )

    def __init__(self):
        self.benchmarks = self._load_benchmarks()

    def _load_benchmarks(self) -> Dict[str, Any]:
        if os.path.exists(BENCHMARKS_PATH):
            with open(BENCHMARKS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def run(
        self,
        crop: str = "rice",
        soil_readings: Optional[Dict[str, Any]] = None,
        field_size_acres: float = 1.0,
        expected_rain_mm: float = 0.0,
        wash_off_danger: bool = False,
        stage: str = "vegetative",
        **kwargs
    ) -> Dict[str, Any]:
        """Compute exact nutrient and irrigation requirements."""
        crop_clean = crop.lower().strip()
        b = self.benchmarks.get(crop_clean, {})
        r = soil_readings or {}

        curr_n = float(r.get("N", r.get("soil_N", 60.0)))
        curr_p = float(r.get("P", r.get("soil_P", 35.0)))
        curr_k = float(r.get("K", r.get("soil_K", 35.0)))
        curr_moist = float(r.get("moisture", r.get("soil_moisture_pct", 30.0)))
        curr_ph = float(r.get("ph", r.get("soil_ph", 6.5)))

        target_n = b.get("optimal_N", {}).get("target", 80)
        target_p = b.get("optimal_P", {}).get("target", 45)
        target_k = b.get("optimal_K", {}).get("target", 40)

        # 1. Nutrient Deficits (in kg/ha or mg/kg equivalent per acre)
        # 1 mg/kg soil test level roughly equates to ~2 kg/ha or ~0.8 kg/acre active nutrient
        n_deficit_kg = max(0.0, (target_n - curr_n) * 0.75)
        p_deficit_kg = max(0.0, (target_p - curr_p) * 0.65)
        k_deficit_kg = max(0.0, (target_k - curr_k) * 0.60)

        # 2. Commercial Fertilizer Conversion
        # DAP provides 46% P2O5 and 18% N
        # First fulfill P using DAP
        dap_kg_acre = round(p_deficit_kg / 0.46, 1) if p_deficit_kg > 0 else 0.0
        n_from_dap = dap_kg_acre * 0.18

        # Remaining N fulfilled using Urea (46% N)
        remaining_n = max(0.0, n_deficit_kg - n_from_dap)
        urea_kg_acre = round(remaining_n / 0.46, 1) if remaining_n > 0 else 0.0

        # K fulfilled using MOP (Muriate of Potash, 60% K2O)
        mop_kg_acre = round(k_deficit_kg / 0.60, 1) if k_deficit_kg > 0 else 0.0

        # Adjust for field size
        total_urea = round(urea_kg_acre * field_size_acres, 1)
        total_dap = round(dap_kg_acre * field_size_acres, 1)
        total_mop = round(mop_kg_acre * field_size_acres, 1)

        # 3. Water Irrigation Dosage Calculation
        # Field capacity benchmark: ~60% for typical loam, ~75% for rice
        target_moisture = 75.0 if crop_clean in ["rice", "jute"] else 55.0
        moisture_deficit_pct = max(0.0, target_moisture - curr_moist)

        # Rule of thumb: 1% soil moisture deficit in top 30cm root zone requires ~1.2 mm water depth
        gross_water_depth_mm = round(moisture_deficit_pct * 1.2, 1)

        # Deduct expected rain from weather forecast
        rain_credit_mm = min(gross_water_depth_mm, expected_rain_mm * 0.8)  # 80% effective rainfall
        net_water_depth_mm = round(max(0.0, gross_water_depth_mm - rain_credit_mm), 1)

        # 1 mm over 1 acre = 4,047 Liters (4.047 m3)
        liters_per_acre = round(net_water_depth_mm * 4047.0, 0)
        total_liters = round(liters_per_acre * field_size_acres, 0)
        cubic_meters = round(total_liters / 1000.0, 1)

        # Application advice
        fertilizer_timing = []
        if wash_off_danger:
            fertilizer_timing.append("HOLD: Imminent heavy rain. Postpone top-dressing until 24 hours after rainfall stops.")
        elif total_urea > 0:
            fertilizer_timing.append(f"Apply {round(total_urea * 0.5, 1)} kg Urea today in morning hours; hold remaining 50% for next week.")
        else:
            fertilizer_timing.append("Nitrogen levels are currently adequate. No immediate Urea required.")

        if total_dap > 0:
            fertilizer_timing.append(f"Apply {total_dap} kg DAP as band placement near root zone.")
        if total_mop > 0:
            fertilizer_timing.append(f"Apply {total_mop} kg MOP to enhance drought resilience and stem strength.")

        # Soil amendment notes
        amendments = []
        if curr_ph < 5.8:
            amendments.append(f"Soil is acidic (pH {curr_ph}). Broadcast 100 kg/acre Agricultural Lime (CaCO3) prior to irrigation.")
        elif curr_ph > 8.0:
            amendments.append(f"Soil is alkaline (pH {curr_ph}). Apply 50 kg/acre Gypsum (CaSO4) to displace excess sodium.")

        return {
            "status": "success",
            "crop": crop_clean,
            "field_size_acres": field_size_acres,
            "soil_initial": {"N": curr_n, "P": curr_p, "K": curr_k, "moisture_pct": curr_moist, "ph": curr_ph},
            "fertilizer_dosage": {
                "per_acre": {
                    "urea_kg": urea_kg_acre,
                    "dap_kg": dap_kg_acre,
                    "mop_kg": mop_kg_acre
                },
                "total_for_field": {
                    "urea_kg": total_urea,
                    "dap_kg": total_dap,
                    "mop_kg": total_mop
                },
                "timing_and_schedule": fertilizer_timing,
                "soil_amendments": amendments,
                "wash_off_warning": wash_off_danger
            },
            "irrigation_dosage": {
                "target_moisture_pct": target_moisture,
                "current_moisture_pct": curr_moist,
                "gross_depth_mm": gross_water_depth_mm,
                "rainfall_deduction_mm": round(rain_credit_mm, 1),
                "net_irrigation_depth_mm": net_water_depth_mm,
                "liters_per_acre": liters_per_acre,
                "total_water_liters": total_liters,
                "cubic_meters": cubic_meters,
                "delivery_recommendation": (
                    "No irrigation required: rainfall will recharge root zone." if net_water_depth_mm <= 0 else
                    f"Deliver {cubic_meters} m³ ({liters_per_acre:.0f} L/acre) via drip irrigation (approx 2.5 - 3 hours runtime)."
                )
            }
        }
