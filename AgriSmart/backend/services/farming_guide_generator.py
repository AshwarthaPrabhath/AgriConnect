"""
Farming Guide Generator
-----------------------
Generates a 5-chapter step-by-step farming journey for a given crop,
written in the voice of a 20-year experienced farmer mentor.
All content is derived from the crop's profile data, personalised to
the user's actual NPK soil values.
"""

from datetime import date

MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]


def _get_season_from_month(month_idx: int) -> str:
    """0=Jan, 11=Dec"""
    if 2 <= month_idx <= 4:
        return "Zaid"
    elif 5 <= month_idx <= 9:
        return "Kharif"
    else:
        return "Rabi"


def _harvest_month_info(current_month_idx: int, harvest_days: int):
    harvest_month_idx = (current_month_idx + harvest_days // 30) % 12
    return MONTH_NAMES[harvest_month_idx], harvest_month_idx


def generate_farming_journey(crop: dict, n: float, p: float, k: float) -> list:
    """
    Returns a list of 5 chapter dicts, each with:
      number, icon, title, mentor_quote, steps (list), tip,
      and optionally water_schedule / next_crop_season info.
    """
    guide  = crop.get("growing_guide", {})
    inputs = crop.get("organic_inputs", {})
    req    = crop.get("npk_required", {})

    # ── NPK gap analysis ─────────────────────────────────────
    n_range = req.get("N", [0, 0])
    p_range = req.get("P", [0, 0])
    k_range = req.get("K", [0, 0])
    n_gap = max(0, n_range[0] - n)
    p_gap = max(0, p_range[0] - p)
    k_gap = max(0, k_range[0] - k)

    # ── Organic inputs ────────────────────────────────────────
    fym       = inputs.get("farmyard_manure_tonnes", 5)
    vermi     = inputs.get("vermicompost_kg", 200)
    cowdung   = inputs.get("cowdung_slurry_litres", 200)
    neem_cake = inputs.get("neem_cake_kg", 50)
    earthworms= inputs.get("earthworms_count", 500)
    biofert   = inputs.get("biofertilizer", "Azospirillum (600g/acre)")
    notes     = inputs.get("notes", "")

    # ── Growing guide fields ──────────────────────────────────
    seed_rate    = guide.get("seed_rate", "as recommended")
    sowing_time  = guide.get("sowing_time", "at the onset of the season")
    land_prep    = guide.get("land_prep", "Plough thoroughly and add FYM.")
    harvest_days = guide.get("harvest_days", 90)
    yield_acre   = guide.get("yield_per_acre_kg", 500)
    market_grade = guide.get("market_grade", "B Grade")
    water_sched  = guide.get("water_schedule", [])

    # ── Season / timing ───────────────────────────────────────
    current_month_idx = date.today().month - 1   # 0-indexed
    harvest_month, harvest_month_idx = _harvest_month_info(current_month_idx, harvest_days)
    next_season = _get_season_from_month(harvest_month_idx)

    # ── Soil status message ───────────────────────────────────
    if n_gap == 0 and p_gap == 0 and k_gap == 0:
        soil_status = (
            "Good news — your soil already has enough N, P, and K for this crop! "
            "We still add organic matter to energise soil life and ensure slow, steady nutrition."
        )
    else:
        parts = []
        if n_gap > 0: parts.append(f"Nitrogen short by {n_gap:.0f} kg/ha")
        if p_gap > 0: parts.append(f"Phosphorus short by {p_gap:.0f} kg/ha")
        if k_gap > 0: parts.append(f"Potassium short by {k_gap:.0f} kg/ha")
        soil_status = (
            f"Your soil needs a little help: {'; '.join(parts)}. "
            "Don't worry — the organic inputs below will fix this naturally before sowing."
        )

    # ── N status indicator label ──────────────────────────────
    n_label = f"⚠ Needs +{n_gap:.0f} kg/ha of Nitrogen" if n_gap > 0 else "✓ Nitrogen level sufficient"
    p_label = f"⚠ Needs +{p_gap:.0f} kg/ha of Phosphorus" if p_gap > 0 else "✓ Phosphorus level sufficient"
    k_label = f"⚠ Needs +{k_gap:.0f} kg/ha of Potassium" if k_gap > 0 else "✓ Potassium level sufficient"

    # ══════════════════════════════════════════════════════════
    #  BUILD CHAPTERS
    # ══════════════════════════════════════════════════════════

    chapters = [
        # ── Chapter 1: Soil Preparation ───────────────────────
        {
            "number": 1,
            "icon": "🌍",
            "title": "Soil Preparation",
            "mentor_quote": "Beta, the soil is the mother of your crop. Feed her right before you ask anything from her.",
            "soil_status": soil_status,
            "steps": [
                {
                    "step": 1,
                    "title": "Plough Your Field Deeply",
                    "detail": (
                        f"{land_prep} "
                        "Plough 2–3 times to a depth of 20–25 cm. This breaks compacted layers, "
                        "removes old weeds, aerates the soil, and lets rainwater reach deep roots. "
                        "The first plough should be done at least 2 weeks before sowing."
                    ),
                    "highlight": None
                },
                {
                    "step": 2,
                    "title": f"Apply Farmyard Manure (FYM) — {fym} Tonnes/Acre",
                    "detail": (
                        f"Spread {fym} tonnes of well-decomposed FYM evenly across the field. "
                        "Mix it into the topsoil during the second or third ploughing. "
                        "FYM feeds soil microbes and slowly releases nitrogen and phosphorus over the season."
                    ),
                    "highlight": n_label
                },
                {
                    "step": 3,
                    "title": f"Add Vermicompost — {vermi} kg/Acre",
                    "detail": (
                        f"Broadcast {vermi} kg of vermicompost over the field after FYM. "
                        "Water lightly after spreading. Vermicompost improves soil texture, "
                        "adds beneficial microbes, and slowly releases phosphorus and micronutrients."
                    ),
                    "highlight": p_label
                },
                {
                    "step": 4,
                    "title": f"Apply Cowdung Slurry — {cowdung} Litres/Acre",
                    "detail": (
                        f"Dilute {cowdung} litres of fresh cowdung slurry in 3× as much water. "
                        "Pour evenly across the field using a watering can or bucket. "
                        "This activates beneficial soil bacteria and adds bio-available potassium."
                    ),
                    "highlight": k_label
                },
                {
                    "step": 5,
                    "title": f"Release Earthworms — {earthworms}/Acre",
                    "detail": (
                        f"Release {earthworms} earthworms evenly across the prepared field. "
                        "They will naturally aerate the soil, improve drainage, and produce rich castings. "
                        "Let the field rest for 5–7 days after all inputs before sowing."
                    ),
                    "highlight": None
                },
                {
                    "step": 6,
                    "title": f"Mix in Neem Cake — {neem_cake} kg/Acre",
                    "detail": (
                        f"Work {neem_cake} kg of Neem Cake into the top 5 cm of soil. "
                        "Neem cake protects against soil-borne insects and root-knot nematodes. "
                        "It also adds nitrogen as it decomposes over 4–6 weeks."
                    ),
                    "highlight": None
                }
            ],
            "tip": (
                f"💡 Farmer's Note: {notes} "
                if notes else
                "💡 Farmer's Note: Keep the field moist (not waterlogged) after applying organic inputs. "
                "Give the soil at least one week to breathe and activate before you sow."
            )
        },

        # ── Chapter 2: Seed Processing ────────────────────────
        {
            "number": 2,
            "icon": "🌰",
            "title": "Seed Processing",
            "mentor_quote": "A sick seed will never give a healthy plant. Invest two hours here and save two months of trouble.",
            "steps": [
                {
                    "step": 1,
                    "title": "Float Test — Select Only the Best Seeds",
                    "detail": (
                        "Fill a large bucket with water. Drop all your seeds in. "
                        "Healthy, heavy seeds sink to the bottom — these are your planting seeds. "
                        "Hollow or diseased seeds float — discard them completely. "
                        "Never skip this step. It can improve your germination rate by 25–40%."
                    ),
                    "highlight": None
                },
                {
                    "step": 2,
                    "title": f"Know Your Seed Requirement — {seed_rate}",
                    "detail": (
                        f"For one acre, you need {seed_rate}. "
                        "Buy 15–20% extra to account for poor germination and gap-filling. "
                        "Always source certified organic seeds from a trusted agricultural office or seed bank — "
                        "avoid seeds saved from hybrid crops as they lose quality in the second generation."
                    ),
                    "highlight": None
                },
                {
                    "step": 3,
                    "title": "Soak Seeds — 8 to 12 Hours",
                    "detail": (
                        "Soak your selected seeds in clean water for 8–12 hours. "
                        "This softens the seed coat and jumpstarts the germination process. "
                        "In cold months (Rabi season), use slightly warm water. "
                        "After soaking, drain and spread on a clean jute cloth in the shade."
                    ),
                    "highlight": None
                },
                {
                    "step": 4,
                    "title": "Biofertilizer Seed Coating",
                    "detail": (
                        f"Apply: {biofert}. "
                        "Mix the biofertilizer powder with a small amount of jaggery water (acts as a sticker). "
                        "Coat the damp seeds thoroughly by hand or rolling in a tray. "
                        "Spread on a jute sack in THE SHADE to dry for 30 minutes. "
                        "⛔ Never expose coated seeds to direct sunlight — the bacteria will die and the treatment is wasted."
                    ),
                    "highlight": "Biofertilizer bacteria work only in shade and cool conditions"
                },
                {
                    "step": 5,
                    "title": "Ready to Sow — Use Same Day",
                    "detail": (
                        "Once the coating is dry to touch (not sticky), seeds are ready for the field. "
                        "Sow on the same day. Do not store coated seeds overnight — "
                        "the bacteria have a limited viability window of 6–8 hours after coating."
                    ),
                    "highlight": None
                }
            ],
            "tip": (
                "💡 Farmer's Tip: Seeds coated with biofertilizer carry living bacteria. "
                "Keep them in the shade, handle gently, and never mix with chemical fertilisers. "
                "One careless moment here can reduce your seasonal yield by 20–30%."
            )
        },

        # ── Chapter 3: Sowing & Planting ─────────────────────
        {
            "number": 3,
            "icon": "🌱",
            "title": "Sowing & Planting",
            "mentor_quote": "The land is ready. The seed is ready. Now your patience and the sky's blessing will do the rest.",
            "steps": [
                {
                    "step": 1,
                    "title": "Choose the Right Sowing Time",
                    "detail": (
                        f"{sowing_time} "
                        "Sow in the early morning (before 9 AM) or late evening (after 5 PM). "
                        "Never sow in the harsh afternoon sun — seeds lose moisture before they can root. "
                        "The soil should be lightly moist, not dry or waterlogged."
                    ),
                    "highlight": None
                },
                {
                    "step": 2,
                    "title": "Mark Straight, Even Rows",
                    "detail": (
                        "Use a rope or straight stick to mark rows across the field before you begin. "
                        "Straight rows allow you to easily walk between plants for watering, weeding, "
                        "and spraying without damaging roots. They also maximise sunlight exposure for every plant."
                    ),
                    "highlight": None
                },
                {
                    "step": 3,
                    "title": "Sowing Depth & Spacing",
                    "detail": (
                        "Make furrows 3–5 cm deep for most crops (6–8 cm for larger seeds like maize or gram). "
                        "Drop 2 seeds per position — this is insurance for poor germination. "
                        "If both sprout, remove the weaker one at Day 10 (thinning). "
                        "Cover gently with fine moist soil — do not press or compact."
                    ),
                    "highlight": None
                },
                {
                    "step": 4,
                    "title": "First Watering — Light & Gentle",
                    "detail": (
                        "Water lightly but evenly right after sowing using a sprinkler or watering can. "
                        "Do NOT flood the rows — flooding washes seeds out of position. "
                        "The goal is moist soil contact with the seed. If rain is expected, skip this step."
                    ),
                    "highlight": None
                },
                {
                    "step": 5,
                    "title": "Germination Watch (Days 5–14)",
                    "detail": (
                        "You should see the first green shoots breaking through in 5–14 days. "
                        "At Day 10: check for patchy areas and do gap-filling by re-sowing in empty spots. "
                        "At Day 10–12: thin overcrowded spots to one plant per position."
                    ),
                    "highlight": None
                }
            ],
            "tip": (
                "💡 Farmer's Tip: Morning sowing gives seeds time to absorb soil moisture before "
                "midday heat arrives. Your germination percentage will be noticeably higher — "
                "experienced farmers always sow at dawn."
            )
        },

        # ── Chapter 4: Growing & Care ─────────────────────────
        {
            "number": 4,
            "icon": "💧",
            "title": "Growing & Care",
            "mentor_quote": "Your crop will speak to you every day. Yellow leaves, wilting, holes — learn to read these signs and act fast.",
            "water_schedule": water_sched,
            "steps": [
                {
                    "step": 1,
                    "title": "Follow the Water Schedule Below",
                    "detail": (
                        "See the water schedule table below for exact stage-by-stage requirements. "
                        "The golden rule: check soil at 5 cm depth. "
                        "If soil clings to your finger → do not water yet. "
                        "If it falls off dry → water now. "
                        "Always water at sunrise or sunset — never in the harsh afternoon."
                    ),
                    "highlight": None
                },
                {
                    "step": 2,
                    "title": "Week 4–6: First Weeding Round",
                    "detail": (
                        "Remove all weeds by hand or a small hoe at 4–6 weeks after sowing. "
                        "This is the most critical weeding window. Weeds compete directly for "
                        "water, sunlight, and soil nutrients. One thorough round at this stage "
                        "can increase your final yield by 15–25%. Do a second weeding at Week 8–9 if needed."
                    ),
                    "highlight": None
                },
                {
                    "step": 3,
                    "title": f"Month 2: Top Dressing (Organic Boost)",
                    "detail": (
                        f"At 45–60 days, apply a top dressing of diluted Cowdung Slurry "
                        f"({cowdung // 2} litres, diluted 1:3 with water) around the base of plants. "
                        f"Also broadcast {neem_cake // 2} kg of Neem Cake between rows. "
                        "This mid-season boost replaces nutrients consumed during early growth."
                    ),
                    "highlight": None
                },
                {
                    "step": 4,
                    "title": "Reading Your Crop's Signals",
                    "detail": (
                        "🟡 Yellowing leaves (starting from older/lower leaves) → Nitrogen deficiency — "
                        "apply extra cowdung slurry. "
                        "🟤 Brown leaf spots or powdery coating → Fungal infection — "
                        "spray diluted sour buttermilk (1:10 water). "
                        "🕳 Holes in leaves → Caterpillar attack — "
                        "apply Neem oil spray (5 mL per 1 litre of water) every 5 days until gone."
                    ),
                    "highlight": None
                },
                {
                    "step": 5,
                    "title": "Common Mistakes to Avoid",
                    "detail": (
                        "❌ Do not apply more manure than recommended — it can burn roots. "
                        "❌ Never water in full afternoon sun — 40% evaporates instantly. "
                        "❌ Do not ignore weeds in Weeks 4–8 — this is the critical window. "
                        "❌ Do not use chemical pesticides — they kill the biofertilizer bacteria in your soil. "
                        "✅ Trust the organic process — visible results come consistently by Week 6."
                    ),
                    "highlight": None
                }
            ],
            "tip": (
                "💡 Farmer's Secret: Mix 1 litre of sour buttermilk + 250g fresh cowdung + 5 litres of water. "
                "Let it ferment for 2 days in the sun. Strain and spray on leaves every 2 weeks. "
                "This is a powerful natural antifungal and pest repellent — free to make, proven across generations."
            )
        },

        # ── Chapter 5: Harvest & Next Crop ───────────────────
        {
            "number": 5,
            "icon": "🌾",
            "title": "Harvest & Next Crop",
            "mentor_quote": "You planted with hope, you tended with care — now the land returns your effort. Harvest right, store right, and plan your next season.",
            "steps": [
                {
                    "step": 1,
                    "title": f"Harvest Time — Around Day {harvest_days} (~{harvest_month})",
                    "detail": (
                        f"Your crop will be ready to harvest approximately {harvest_days} days from sowing — "
                        f"around {harvest_month}. "
                        "Watch for visible signs: grain colour change, hardening of seeds, "
                        "leaf drying and browning at the bottom. Do not wait too long — "
                        "overripe crops shatter or attract birds and rodents."
                    ),
                    "highlight": None
                },
                {
                    "step": 2,
                    "title": "Harvest in the Early Morning",
                    "detail": (
                        "Always cut or pick in the early morning when temperatures are cool. "
                        "Morning harvest preserves moisture in the produce, extends shelf life, "
                        "and reduces stress on the plant if it's a partial harvest (e.g., fruits or vegetables). "
                        "Use clean, sharp cutting tools — blunt tools tear the plant and invite disease."
                    ),
                    "highlight": None
                },
                {
                    "step": 3,
                    "title": "Sun-Drying",
                    "detail": (
                        "Spread harvested produce in clean open sunlight for 2–3 days. "
                        "For grain crops: thresh first (separate grain from stalk by beating or machine), "
                        "then winnow (toss in breeze) to remove chaff. "
                        "Check moisture: grain should feel completely dry and hard to bite before storage."
                    ),
                    "highlight": None
                },
                {
                    "step": 4,
                    "title": "Proper Storage",
                    "detail": (
                        "Store in a cool, dry, well-ventilated space. "
                        "Use gunny (jute) bags — never plastic bags which trap moisture and cause mold. "
                        "Place dried neem leaves inside storage bags to prevent insect infestation naturally. "
                        "Inspect every 2 weeks. If moisture appears, dry again immediately."
                    ),
                    "highlight": None
                },
                {
                    "step": 5,
                    "title": f"Your Expected Yield",
                    "detail": (
                        f"Following these organic methods on one acre, expect approximately "
                        f"{yield_acre} kg of produce. "
                        f"Market grade: {market_grade}. "
                        "At local mandis, organically grown produce consistently fetches 20–30% premium "
                        "over chemically grown crops — especially with an organic certification."
                    ),
                    "highlight": f"Estimate: {yield_acre} kg per acre"
                }
            ],
            "next_crop_season": next_season,
            "harvest_month_name": harvest_month,
            "tip": (
                "💡 Farmer's Tip: Before you rest, open your field diary and write down "
                "what worked and what you'd do differently. The best farmers I've met in 20 years "
                "all kept notes. Your observations from this crop will make your next season your best season."
            )
        }
    ]

    return chapters
