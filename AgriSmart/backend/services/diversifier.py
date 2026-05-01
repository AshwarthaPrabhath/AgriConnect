"""
Regional Crop Diversification Engine
-------------------------------------
Identifies crops that are NOT traditionally grown in a region
but are agronomically suitable for the current soil NPK state.
"""

import json, os
from .soil_sequencer import get_recommendations

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REGION_F  = os.path.join(BASE_DIR, "..", "models", "region_profiles.json")
PROFILES  = os.path.join(BASE_DIR, "..", "models", "crop_profiles.json")

with open(REGION_F) as f:
    REGIONS = json.load(f)

with open(PROFILES) as f:
    _data = json.load(f)
    ALL_CROPS = {c["label"]: c for c in _data["crops"]}


def get_diversification_suggestions(n, p, k, season, region, water_source, top_n=4):
    """
    Returns crops suitable for the soil that are NOT traditionally grown in the region.
    Also returns the unexplored crop opportunities from region data.
    """
    region_data = REGIONS.get(region, {})
    traditional = [t.lower() for t in region_data.get("traditional_crops", [])]

    # Get full recommendations first
    all_recs = get_recommendations(n, p, k, season, region, water_source, top_n=15)

    # Filter out traditional crops
    novel_recs = [
        r for r in all_recs
        if r["name"].lower() not in traditional
    ][:top_n]

    # Get unexplored opportunities from region profile
    unexplored = region_data.get("unexplored_crops", [])

    return {
        "region": region,
        "traditional_crops": region_data.get("traditional_crops", []),
        "soil_type": region_data.get("soil_type", "Unknown"),
        "novel_recommendations": novel_recs,
        "unexplored_opportunities": unexplored,
        "message": (
            f"Your region ({region}) has traditionally grown "
            f"{', '.join(region_data.get('traditional_crops', [])[:3])}. "
            f"Here are crops your soil can support that most farmers haven't tried yet."
        )
    }
