"""
Soil Sequence Engine
--------------------
Uses the NPK Transition Graph to find the optimal crop rotation
sequence that minimises external fertiliser input while maximising yield.
"""

import json
import os
from copy import deepcopy

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILES_PATH = os.path.join(BASE_DIR, "..", "models", "crop_profiles.json")

with open(PROFILES_PATH, "r") as f:
    _data = json.load(f)
    CROPS = _data["crops"]
    WATER_MAP = _data.get("water_need_map", {}) # Fallback to empty dict


def _npk_in_range(n, p, k, crop):
    req = crop["npk_required"]
    return (
        req["N"][0] <= n <= req["N"][1] and
        req["P"][0] <= p <= req["P"][1] and
        req["K"][0] <= k <= req["K"][1]
    )


def _partial_score(n, p, k, crop):
    """Score 0-1 for how well current NPK fits the crop requirements (partial match)."""
    req = crop["npk_required"]
    scores = []
    for val, (lo, hi) in [(n, req["N"]), (p, req["P"]), (k, req["K"])]:
        mid = (lo + hi) / 2
        spread = (hi - lo) / 2 or 1
        s = max(0.0, 1.0 - abs(val - mid) / (spread * 2))
        scores.append(s)
    return sum(scores) / 3


def _filter_crops(n, p, k, season, region, water_source):
    water_need = WATER_MAP.get(water_source, "medium")
    results = []
    for crop in CROPS:
        # Season & region filter
        if season and season not in crop["seasons"]:
            continue
        if region and region not in crop["regions"]:
            continue
        # Water availability filter (high need crops need canal/tank/high source)
        if crop["water_need"] == "high" and water_need == "low":
            continue

        score = _partial_score(n, p, k, crop)
        if score > 0.25:  # minimum viability threshold
            results.append((crop, score))

    results.sort(key=lambda x: -x[1])
    return results


def get_recommendations(n, p, k, season, region, water_source, top_n=5):
    """
    Returns top N crop recommendations with suitability scores,
    NPK gap analysis, and explanation.
    """
    filtered = _filter_crops(n, p, k, season, region, water_source)
    if not filtered:
        return []

    output = []
    for crop, score in filtered[:top_n]:
        req = crop["npk_required"]
        n_gap = max(0, req["N"][0] - n)
        p_gap = max(0, req["P"][0] - p)
        k_gap = max(0, req["K"][0] - k)
        total_gap = n_gap + p_gap + k_gap

        explanation = _build_explanation(n, p, k, crop, n_gap, p_gap, k_gap)

        output.append({
            "name": crop["name"],
            "label": crop["label"],
            "suitability_score": round(score * 100, 1),
            "yield_score": crop["yield_score"],
            "npk_required": req,
            "external_input_needed": {
                "N": n_gap, "P": p_gap, "K": k_gap, "total": total_gap
            },
            "post_harvest_npk_delta": crop["npk_delta"],
            "water_need": crop["water_need"],
            "seasons": crop["seasons"],
            "description": crop["description"],
            "post_crop_benefit": crop["post_crop_benefit"],
            "explanation": explanation
        })

    return output


def _build_explanation(n, p, k, crop, n_gap, p_gap, k_gap):
    parts = []
    req = crop["npk_required"]

    if n >= req["N"][0] and n <= req["N"][1]:
        parts.append(f"Your N={n} is within the ideal range [{req['N'][0]}–{req['N'][1]}]")
    elif n_gap > 0:
        parts.append(f"Needs +{n_gap} kg/ha of Nitrogen externally")
    else:
        parts.append(f"Soil N={n} exceeds requirement; no extra N needed")

    if p >= req["P"][0] and p <= req["P"][1]:
        parts.append(f"P={p} is ideal [{req['P'][0]}–{req['P'][1]}]")
    elif p_gap > 0:
        parts.append(f"Needs +{p_gap} kg/ha of Phosphorus externally")

    if k >= req["K"][0] and k <= req["K"][1]:
        parts.append(f"K={k} is ideal [{req['K'][0]}–{req['K'][1]}]")
    elif k_gap > 0:
        parts.append(f"Needs +{k_gap} kg/ha of Potassium externally")

    delta = crop["npk_delta"]
    n_after = n + delta["N"]
    p_after = p + delta["P"]
    k_after = k + delta["K"]
    parts.append(
        f"After harvest: soil N→{n_after}, P→{p_after}, K→{k_after}"
    )
    return ". ".join(parts) + "."


def get_rotation_sequence(n, p, k, season, region, water_source, seasons_ahead=3):
    """
    Greedy multi-season crop rotation planner.
    Finds the sequence minimising total external NPK input while maximising cumulative yield.
    """
    season_order = ["Kharif", "Rabi", "Zaid"]
    current_season_idx = season_order.index(season) if season in season_order else 0

    state = {"N": n, "P": p, "K": k}
    sequence = []
    total_external = 0

    for i in range(seasons_ahead):
        cur_season = season_order[(current_season_idx + i) % len(season_order)]
        recs = get_recommendations(
            state["N"], state["P"], state["K"],
            cur_season, region, water_source, top_n=3
        )
        if not recs:
            break

        # Pick best: minimise external input, then maximise yield
        best = min(recs, key=lambda x: (x["external_input_needed"]["total"], -x["yield_score"]))

        delta = best["post_harvest_npk_delta"]
        new_state = {
            "N": max(0, state["N"] + delta["N"]),
            "P": max(0, state["P"] + delta["P"]),
            "K": max(0, state["K"] + delta["K"])
        }

        sequence.append({
            "season": cur_season,
            "season_number": i + 1,
            "crop": best["name"],
            "label": best["label"],
            "suitability_score": best["suitability_score"],
            "external_input_needed": best["external_input_needed"],
            "soil_before": deepcopy(state),
            "soil_after": deepcopy(new_state),
            "post_crop_benefit": best["post_crop_benefit"],
            "explanation": best["explanation"]
        })

        total_external += best["external_input_needed"]["total"]
        state = new_state

    return {
        "sequence": sequence,
        "total_external_npk_needed": total_external,
        "final_soil_state": state,
        "seasons_planned": len(sequence)
    }
