"""
Organic Advisor Service
-----------------------
Calculates organic input requirements per acre for a given crop.
Returns quantities of cowdung, vermicompost, earthworms, biofertilizers etc.
Also calculates yield prediction.
"""

import json, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILES  = os.path.join(BASE_DIR, "..", "models", "crop_profiles.json")

with open(PROFILES) as f:
    _data  = json.load(f)
    _CROPS = {c["label"]: c for c in _data["crops"]}

from services.farming_guide_generator import generate_farming_journey



def get_organic_plan(crop_label: str, area_acres: float = 1.0, user_mode: str = "farmer",
                     n: float = 0, p: float = 0, k: float = 0) -> dict:
    """
    Returns the organic input plan and yield prediction for a crop.
    user_mode: 'farmer' → per-acre litres/irrigation
               'beginner' or 'urban' → per-plant litres/day
    """
    crop = _CROPS.get(crop_label)
    if not crop:
        return {"error": f"Crop '{crop_label}' not found."}

    guide  = crop.get("growing_guide", {})
    inputs = crop.get("organic_inputs", {})

    # Scale organic inputs by area
    fym_tonnes           = round(inputs.get("farmyard_manure_tonnes", 5) * area_acres, 1)
    vermicompost_kg      = round(inputs.get("vermicompost_kg", 200) * area_acres, 0)
    earthworms           = int(inputs.get("earthworms_count", 500) * area_acres)
    cowdung_slurry_lt    = int(inputs.get("cowdung_slurry_litres", 200) * area_acres)
    neem_cake_kg         = round(inputs.get("neem_cake_kg", 50) * area_acres, 0)
    biofertilizer        = inputs.get("biofertilizer", "")

    # Yield prediction
    yield_per_acre       = guide.get("yield_per_acre_kg", 600)
    total_yield          = round(yield_per_acre * area_acres, 1)
    yield_per_plant_month= guide.get("yield_per_plant_kg_month", None)

    # Water schedule selection based on user mode
    water_schedule_raw   = guide.get("water_schedule", [])
    water_schedule       = []
    for entry in water_schedule_raw:
        if user_mode == "farmer":
            water_schedule.append({
                "stage": entry["stage"],
                "days":  entry["days"],
                "litres_per_acre": entry.get("litres_per_acre", entry.get("water_mm", 40) * 4000)
            })
        else:  # beginner / urban
            water_schedule.append({
                "stage": entry["stage"],
                "days":  entry["days"],
                "litres_per_plant_per_day": entry.get("litres_per_plant_per_day", 0.5)
            })

    # ── Generate 5-chapter farming journey ───────────────────
    farming_journey = generate_farming_journey(crop, n, p, k)

    return {
        "crop": crop["name"],
        "label": crop_label,
        "area_acres": area_acres,
        "user_mode": user_mode,
        "growing_summary": {
            "land_prep": guide.get("land_prep", ""),
            "sowing_time": guide.get("sowing_time", ""),
            "seed_rate": guide.get("seed_rate", ""),
            "harvest_days": guide.get("harvest_days", 90),
            "market_grade": guide.get("market_grade", "B"),
        },
        "water_schedule": water_schedule,
        "organic_inputs": {
            "farmyard_manure_tonnes": fym_tonnes,
            "vermicompost_kg": vermicompost_kg,
            "earthworms_count": earthworms,
            "cowdung_slurry_litres": cowdung_slurry_lt,
            "neem_cake_kg": neem_cake_kg,
            "biofertilizer": biofertilizer,
            "notes": inputs.get("notes", "")
        },
        "yield_prediction": {
            "total_kg": total_yield,
            "per_acre_kg": yield_per_acre,
            "per_plant_kg_month": yield_per_plant_month,
            "harvest_days": guide.get("harvest_days", 90)
        },
        "farming_journey": farming_journey
    }
