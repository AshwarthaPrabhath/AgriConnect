"""
AgriSmart v2.0 — Flask API
"""
import uuid
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS

from services.soil_sequencer import get_recommendations, get_rotation_sequence, CROPS
from services.firebase_service import save_recommendation, get_history
from services.organic_advisor import get_organic_plan
from services.diversifier import get_diversification_suggestions
from services.auth_service import login_user, register_user

import json, os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app, origins="*")

# ── Health ─────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "version": "2.0.0"})

# ── Authentication ───────────────────────────────────────────
@app.route("/api/login", methods=["POST"])
def login():
    body = request.get_json(force=True)
    email = body.get("email")
    password = body.get("password")
    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required."}), 400
    return jsonify(login_user(email, password))

@app.route("/api/signup", methods=["POST"])
def signup():
    body = request.get_json(force=True)
    email = body.get("email")
    password = body.get("password")
    name = body.get("name", "")
    phone = body.get("phone", "")
    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required."}), 400
    return jsonify(register_user(email, password, name, phone))

# ── Crop Recommendation ────────────────────────────────────
@app.route("/api/recommend", methods=["POST"])
def recommend():
    body = request.get_json(force=True)
    try:
        n = float(body["N"]); p = float(body["P"]); k = float(body["K"])
    except (KeyError, ValueError):
        return jsonify({"error": "N, P, K required and must be numeric."}), 400

    season       = body.get("season", "")
    region       = body.get("region", "")
    water_source = body.get("water_source", "Rainfed")
    top_n        = int(body.get("top_n", 5))
    user_mode    = body.get("user_mode", "beginner")  # 'beginner' | 'farmer'

    # Map simple mode inputs (Poor/Average/Rich) to numeric
    simple_n = body.get("simple_N")
    simple_p = body.get("simple_P")
    simple_k = body.get("simple_K")
    level_map = {"Poor": 20, "Average": 60, "Rich": 120}
    if simple_n: n = level_map.get(simple_n, n)
    if simple_p: p = level_map.get(simple_p, p)
    if simple_k: k = level_map.get(simple_k, k)

    recs = get_recommendations(n, p, k, season, region, water_source, top_n)
    if not recs:
        return jsonify({"success": False, "message": "No crops matched.", "recommendations": []})

    session_id = str(uuid.uuid4())
    save_recommendation(session_id, {
        "session_id": session_id,
        "timestamp": datetime.utcnow().isoformat(),
        "inputs": {"N": n, "P": p, "K": k, "season": season, "region": region, "water_source": water_source, "user_mode": user_mode},
        "recommendations": recs
    })

    return jsonify({"success": True, "session_id": session_id,
                    "inputs": {"N": n, "P": p, "K": k, "season": season, "region": region, "water_source": water_source},
                    "user_mode": user_mode, "recommendations": recs})

# ── Crop Rotation Sequence ─────────────────────────────────
@app.route("/api/sequence", methods=["POST"])
def sequence():
    body = request.get_json(force=True)
    try:
        n = float(body["N"]); p = float(body["P"]); k = float(body["K"])
    except (KeyError, ValueError):
        return jsonify({"error": "N, P, K required."}), 400

    season        = body.get("season", "Kharif")
    region        = body.get("region", "")
    water_source  = body.get("water_source", "Rainfed")
    seasons_ahead = min(int(body.get("seasons_ahead", 3)), 5)

    result = get_rotation_sequence(n, p, k, season, region, water_source, seasons_ahead)
    return jsonify({"success": True, "inputs": {"N": n, "P": p, "K": k}, "rotation": result})

# ── Full Crop Growing Guide ────────────────────────────────
@app.route("/api/crop-guide/<label>", methods=["GET"])
def crop_guide(label):
    area  = float(request.args.get("area", 1.0))
    mode  = request.args.get("mode", "beginner")
    n     = float(request.args.get("N", 0))
    p     = float(request.args.get("P", 0))
    k     = float(request.args.get("K", 0))
    plan  = get_organic_plan(label, area, mode, n, p, k)
    if "error" in plan:
        return jsonify(plan), 404
    return jsonify(plan)


# ── Regional Diversification ───────────────────────────────
@app.route("/api/diversify", methods=["POST"])
def diversify():
    body = request.get_json(force=True)
    try:
        n = float(body["N"]); p = float(body["P"]); k = float(body["K"])
    except (KeyError, ValueError):
        return jsonify({"error": "N, P, K required."}), 400

    season       = body.get("season", "Kharif")
    region       = body.get("region", "")
    water_source = body.get("water_source", "Rainfed")

    result = get_diversification_suggestions(n, p, k, season, region, water_source)
    return jsonify({"success": True, "result": result})

# ── Crop Catalog ───────────────────────────────────────────
@app.route("/api/crops", methods=["GET"])
def crop_list():
    simplified = [{"name": c["name"], "label": c["label"],
                   "seasons": c["seasons"], "water_need": c["water_need"],
                   "npk_required": c["npk_required"]} for c in CROPS]
    return jsonify({"crops": simplified, "count": len(simplified)})

# ── History ────────────────────────────────────────────────
@app.route("/api/history/<session_id>", methods=["GET"])
def history(session_id):
    return jsonify({"history": get_history(session_id)})

if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")
