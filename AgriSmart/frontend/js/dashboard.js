/* ═══════════════════════════════════════════════════════════════
   AgriConnect — dashboard.js
   Complete farmer-guided growing experience with step-by-step
   process, real crop data, and full loop navigation.
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

  /* ── DOM References ─────────────────────────────────────── */
  const stage2 = document.getElementById("stage2-form");
  const stage3 = document.getElementById("stage3-list");
  const stage4 = document.getElementById("stage4-details");

  const form = document.getElementById("soilFormBeginner");
  const btnAnalyse = document.getElementById("analyseBeginner");
  const btnBack2 = document.getElementById("btnBackToStage2");
  const btnBack3 = document.getElementById("btnBackToStage3");

  const npkDisplay = document.getElementById("npkDisplay");
  const cropCards = document.getElementById("cropCards");
  const guideCropName = document.getElementById("guideCropName");
  const growingGuideContent = document.getElementById("growingGuideContent");
  const organicGrid = document.getElementById("organicGrid");
  const rotationTimeline = document.getElementById("rotationTimeline");
  const stage4CropTitle = document.getElementById("stage4CropTitle");

  /* ── Global Context ─────────────────────────────────────── */
  let ctx = { N: 0, P: 0, K: 0, region: "", water_source: "" };

  /* ── Auto-season from month ─────────────────────────────── */
  function getAutoSeason() {
    const m = new Date().getMonth();
    if (m >= 2 && m <= 4) return "Zaid";
    if (m >= 5 && m <= 9) return "Kharif";
    return "Rabi";
  }

  /* ═══════════════════════════════════════════════════════════
     CROP DATABASE  — full farmer knowledge, 10 major crops
     Each crop has:
       • farmerIntro  – how an old farmer would greet the crop
       • steps[]      – the full growing guide in a farmer's voice
         Each step: { title, icon, duration, tip, detail }
       • organicPlan  – soil prep, inputs, quantities
       • waterPlan    – stage-wise water schedule
       • yield        – realistic yield per acre
       • nextCrops    – rotation suggestions
       • suitNPK      – N/P/K range it thrives in
       • regions      – which Indian states it fits
       • water        – water need level
       • seasons      – suitable seasons
  ═══════════════════════════════════════════════════════════ */
  const CROP_DB = {

    rice: {
      name: "Rice (Paddy)",
      label: "rice",
      icon: "🌾",
      suitNPK: { N: [60, 120], P: [30, 60], K: [30, 60] },
      regions: ["West Bengal", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Odisha", "Assam", "Bihar", "Uttar Pradesh", "Chhattisgarh", "Punjab"],
      seasons: ["Kharif"],
      water: "HIGH",
      suitabilityScore: 0,
      description: "The backbone of India. Grows best in flooded fields with warm, humid climate. Feeds more Indians than any other crop.",
      farmerIntro: "Son, rice is not just a crop — it is our life. My grandfather grew it, my father grew it, and I have grown it for 20 years. Let me tell you everything I know, step by step, the way no textbook will ever tell you.",
      yield: "18–22 quintals per acre",
      nextCrops: ["wheat", "mustard", "potato"],
      steps: [
        {
          title: "Land Preparation & Puddling",
          icon: "🚜",
          duration: "10–14 days before transplanting",
          tip: "Old farmer's rule: if the mud does not stick to your palm when you squeeze it, the field is not ready.",
          detail: `First, give the field a deep ploughing — at least 20 to 25 cm deep. Do this when the soil has some moisture, not bone dry. After ploughing, flood the field with about 5 cm of water and let it soak for 2 days.

Now comes puddling. Run the rotavator or a pair of bullocks through the wet field 2–3 times. What you are trying to do is break every air pocket in the soil and create a compact layer underneath so water does not drain away fast. When you finish, the field should look like a smooth chocolate pudding — no big clods, completely level.

Levelling is extremely important. Uneven fields waste 30% more water. Use a laser leveller if available, or stretch a string across and fill low spots by hand. Water should stand evenly at 3–5 cm everywhere.`
        },
        {
          title: "Nursery Preparation & Seed Treatment",
          icon: "🌱",
          duration: "25–30 days before main field transplanting",
          tip: "Never skip seed treatment. A diseased seed will ruin your whole nursery. I learned this the hard way in 2008.",
          detail: `Choose a seed rate of 20–25 kg per acre for transplanted rice. First, float the seeds in water — throw away every seed that floats, those are empty and worthless. Use only the ones that sink.

Now make a solution of 1 litre of water + 25 grams of salt. Dip the seeds in this for 20 minutes. This removes light, hollow grains. After that, soak the good seeds in plain water for 24 hours.

Treat the soaked seeds with Trichoderma viride — 4 grams per kg of seed — to protect against seed-borne fungal diseases. Mix it well so every seed is coated. Keep it in shade for 24 hours before sowing.

For the nursery bed, prepare a raised bed 1 metre wide and as long as needed. Mix well-rotted farmyard manure (2 kg per square metre) into the top 10 cm of soil. Sow seeds uniformly and cover lightly with soil. Water gently twice a day. Seedlings will be ready in 25–30 days when they are 20–25 cm tall with 5–6 leaves.`
        },
        {
          title: "Transplanting",
          icon: "🤲",
          duration: "1–2 days, at 21–25 days of seedling age",
          tip: "Two seedlings per hill, not more. I know it feels like more is better — it is not. They compete with each other and yield drops.",
          detail: `Transplant in the morning or late evening — never in harsh midday sun. Seedlings in hot sun go into shock and take 7–10 extra days to recover.

Maintain a spacing of 20 cm × 15 cm between rows and plants. Use a rope stretched across the field to keep rows straight — crooked rows make weeding 3 times harder.

Plant 2 seedlings per hill, pushed 3–4 cm into the mud — not too deep, not too shallow. If you push too deep, tillering is delayed. Too shallow and the plants float away.

Keep 3–5 cm standing water immediately after transplanting. This controls weeds and helps the plants settle. If you see yellowing in the first week, do not panic — it is transplanting shock and it passes on its own within 5–7 days.`
        },
        {
          title: "Fertiliser & Nutrient Management",
          icon: "🧪",
          duration: "Applied in splits — 3 times during crop",
          tip: "Split application is the biggest secret to good yield. Most farmers give all urea at once and half of it evaporates. Split it into 3 doses and watch the difference.",
          detail: `Basal dose (at transplanting): Apply 2 tonnes of well-rotted FYM per acre into the soil before puddling. This builds the foundation.

First top-dressing (21 days after transplanting): Apply 1/3rd of your total urea dose. At this stage, the crop is actively tillering (making new shoots). Nitrogen now means more tillers, more panicles, more grain.

Second top-dressing (45 days after transplanting, at panicle initiation): Apply remaining 2/3rd of urea. This is the most critical time. The panicle — the part that will carry your grain — is forming inside the stem. Nitrogen here fills the grains.

Drain the field before each fertiliser application and restore water 2 days after. Never apply urea to flooded fields — it converts to ammonia gas and escapes into the air. You are literally throwing money away.

Phosphorus and Potash: Apply the full dose as basal (before transplanting). They do not need splitting.`
        },
        {
          title: "Weed & Pest Management",
          icon: "🐛",
          duration: "Continuous monitoring — critical in weeks 2–6",
          tip: "First 30 days are the golden window. A weed-free first month guarantees 70% of your yield. After 40 days, weeds matter less because the crop shades them out.",
          detail: `Manual weeding: Do the first weeding at 20–25 days after transplanting (DAT). Use a cono-weeder between rows — it kills weeds and aerates the soil simultaneously. Do the second weeding at 40–45 DAT.

For Stem Borer (the most common enemy of rice): You will know it by 'dead hearts' — the central shoot of a tiller turns yellow and pulls out easily. Set up pheromone traps (5 per acre) to monitor moth populations. If you see more than 5 moths per trap per week, spray Chlorantraniliprole 18.5% SC at 3 ml per 10 litres of water.

For Brown Plant Hopper: Check the base of the plant. If you see small wedge-shaped insects in large numbers at the base of tillers, drain the field immediately for 5–7 days. Dryness kills them. If still severe, spray Imidacloprid 17.8% SL at 3 ml per 10 litres.

For Blast disease (grey lesions on leaves with darker borders): Spray Tricyclazole 75% WP at 6 grams per 10 litres. Do this at flag leaf stage preventively if weather is humid and cloudy.`
        },
        {
          title: "Water Management",
          icon: "💧",
          duration: "Throughout the season — critical to manage",
          tip: "Continuous flooding wastes 40% more water. Alternate wetting and drying (AWD) saves water and sometimes even increases yield. My neighbour switched and saved ₹3000 per acre on pump costs.",
          detail: `Week 1–2 (after transplanting): Maintain 3–5 cm of standing water. This is essential for plant establishment and weed suppression.

Week 3–6 (tillering stage): Practice Alternate Wetting and Drying (AWD). Let the water level drop to 15 cm BELOW the soil surface, then re-flood to 5 cm. Do this cycle repeatedly. Insert a PVC pipe (bamboo also works) into the soil to measure water level without digging.

Week 7–9 (panicle initiation to flowering): This is the most water-sensitive stage. NEVER let the field go dry. Keep 5 cm standing water continuously. Any drought stress here causes blank spikelets — empty grains that do not fill.

Week 10–14 (grain filling): Maintain 2–3 cm water. Shallow is fine.

Final 2 weeks before harvest: Drain the field completely. Dry soil makes harvesting much easier and grains fill more uniformly.`
        },
        {
          title: "Harvest & Post-Harvest",
          icon: "🌾",
          duration: "At 80% grain maturity — around 105–120 days",
          tip: "Do not wait for 100% maturity. At 80% maturity, the remaining 20% fills during drying. Late harvest means grain shattering — paddy falls to the ground and you lose yield.",
          detail: `How to know when to harvest: Check the grains on the panicle. When 80–85% of grains have turned golden-yellow and the panicle has bent downward under the weight of grain — it is time.

Drain the field 10–15 days before harvest so the soil is firm enough for machines or human feet.

Harvest using a reaper or combine harvester. If cutting manually, use a sharp sickle and cut close to the ground. Immediately bundle and stand the bundles upright in the field for 2–3 days to dry.

Threshing: Use a mechanical thresher within 2–3 days of cutting. Delay causes fungal growth on the grain.

Drying: Spread paddy on a clean threshing floor in a 5–7 cm layer and dry under sun for 3–4 days until moisture content reaches 14% or below. Grip a handful and press — the grains should feel dry and click against each other, not soft.

Storage: Store in moisture-proof bags or metal bins. Sprinkle neem leaves between layers to repel storage insects. A properly stored paddy can last 12–18 months.`
        }
      ],
      organicPlan: {
        soilPrep: "Deep plough + puddle + laser level. Add 2 tonnes FYM per acre before puddling.",
        biofertilizer: "Azospirillum 500g + Blue-Green Algae 10 packets per acre mixed in soil at transplanting",
        farmyardManure: "2 tonnes per acre (applied before puddling)",
        vermicompost: "250 kg per acre (as basal top-dress at 20 DAT)",
        neem: "Neem cake 100 kg per acre mixed in soil — controls soil pests and releases N slowly",
      },
      waterPlan: [
        { stage: "Transplanting", days: "Day 1–14", amount: "3–5 cm standing water" },
        { stage: "Tillering (AWD)", days: "Day 15–42", amount: "Let drop to -15cm, refill to 5cm" },
        { stage: "Panicle Init.", days: "Day 43–70", amount: "5 cm — never let dry" },
        { stage: "Grain Filling", days: "Day 71–100", amount: "2–3 cm" },
        { stage: "Pre-harvest", days: "Day 101–harvest", amount: "Drain completely" },
      ]
    },

    wheat: {
      name: "Wheat",
      label: "wheat",
      icon: "🌿",
      suitNPK: { N: [60, 120], P: [30, 60], K: [20, 40] },
      regions: ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Bihar", "Uttarakhand"],
      seasons: ["Rabi"],
      water: "MEDIUM",
      suitabilityScore: 0,
      description: "The king of Rabi crops. Loves cool winters. With good seed and timely sowing, wheat rarely disappoints.",
      farmerIntro: "Beta, I have sown wheat for 22 winters without missing a single year. Wheat is honest — you put in honest work and it gives you honest returns. Let me walk you through it like my father walked me.",
      yield: "15–20 quintals per acre",
      nextCrops: ["rice", "maize", "cotton"],
      steps: [
        {
          title: "Land Preparation",
          icon: "🚜",
          duration: "1–2 weeks before sowing",
          tip: "Wheat loves a firm, fine seedbed. Big clods mean uneven germination and you lose 15–20% of your plants before they even start.",
          detail: `After the previous kharif crop is harvested, give the field 2–3 ploughings. First ploughing should be deep (20–25 cm) with a mould-board plough to bury crop residue. Second and third ploughings are shallower (10–12 cm) to break clods.

After each ploughing, run a rotavator or harrow to break clods further. The ideal wheat seedbed feels like coarse sand — every particle less than 1 cm, no big lumps.

Level the field carefully. Wheat is sown dry unlike rice, so levelling is about ensuring uniform germination — water from rains or irrigation should not pool anywhere and drown young seedlings.

Allow the field to settle for 3–4 days after final preparation before sowing. If soil feels powdery and dusty, give a light pre-sowing irrigation (called palewa) 4–5 days before sowing. Sow when soil moisture is at 'field capacity' — not wet, not dry, like a wrung-out sponge.`
        },
        {
          title: "Seed Selection & Treatment",
          icon: "🌱",
          duration: "2 days before sowing",
          tip: "Use certified seed every 3–4 years. Your saved seed degrades. I tried saving seed for 8 years and my yield dropped 30%. The seed company was right.",
          detail: `Recommended varieties by region:
— Punjab/Haryana: HD-2967, PBW-550, WH-1105
— UP/Bihar: GW-322, K-307, HI-8498
— MP/Rajasthan: Raj-4120, GW-496

Seed rate: 40 kg per acre for normal sowing. If sowing late (after 25 November), increase to 50 kg per acre to compensate for poor tillering.

Seed treatment: Dissolve Carboxin 37.5% + Thiram 37.5% WS (Vitavax Power) at 2.5 grams per kg of seed. Mix dry — do not make a liquid solution. Rub the powder onto seeds until every seed is lightly coated grey-white. This protects against Loose Smut, the most destructive wheat disease.

For extra protection, treat with Trichoderma viride at 4 grams per kg of seed after the fungicide treatment dries.`
        },
        {
          title: "Sowing",
          icon: "🤲",
          duration: "1–2 days, October 25 – November 25 (ideal window)",
          tip: "Every week of delay after November 15 costs you 1 quintal per acre. This is not a guess — it is measured science. Timely sowing is the single biggest factor in wheat yield.",
          detail: `Sow using a seed-cum-fertiliser drill for best results. This places seed and basal fertiliser simultaneously in rows — efficient and precise.

Row spacing: 22.5 cm (9 inches) for normal conditions. Reduce to 18 cm for late sowing to compensate with more plants per unit area.

Sowing depth: 5–6 cm. Shallower seeds dry out before germination. Deeper seeds take too long to emerge and waste energy.

Seed placement: The seed drill places seeds uniformly. If sowing manually, make furrows with a hoe and drop 2–3 seeds every 10 cm. Cover lightly and firm down the soil above the seed row with the back of the hoe.

After sowing, give a light planking (running a flat board over the field) to firm the seedbed and ensure good seed-soil contact. Good seed-soil contact is the difference between 80% germination and 95% germination.`
        },
        {
          title: "Fertiliser Management",
          icon: "🧪",
          duration: "Basal + 2 top-dressings",
          tip: "Wheat is a heavy nitrogen feeder — but all at once is wrong. Half at sowing, quarter at first irrigation, quarter at second irrigation. This timing changed my yield from 16 to 21 quintals.",
          detail: `Basal dose (at sowing, placed with seed drill):
— DAP (18:46:00): 50 kg per acre → provides Phosphorus for root development
— MOP (0:0:60): 25 kg per acre → Potassium for stem strength and disease resistance
— Half the urea dose: 30 kg per acre

First top-dressing (Crown Root Initiation stage — 18–21 days after sowing, at first irrigation):
— Apply 30 kg urea per acre. Broadcast by hand immediately before irrigation so water dissolves and carries it into the root zone. This is when wheat develops its root system — nitrogen now builds strong roots.

Second top-dressing (Tillering stage — 35–40 days, at second irrigation):
— Apply remaining 30 kg urea per acre.
— If crop looks pale yellow, also apply Zinc Sulphate 5 kg per acre dissolved in water (foliar spray).`
        },
        {
          title: "Irrigation Schedule",
          icon: "💧",
          duration: "4–6 irrigations total depending on rainfall",
          tip: "Crown Root Initiation (20–22 days) is the most critical irrigation in wheat. Miss this and you lose 30% yield. Nothing recovers it. Mark it on your calendar the day you sow.",
          detail: `Irrigation 1 — Crown Root Initiation (20–22 DAS): Most critical. Apply gently — heavy flow can uproot young seedlings. This irrigation is non-negotiable even if rain is expected.

Irrigation 2 — Tillering (40–45 DAS): Wheat is making new shoots. Water pushes tillering and each tiller becomes a potential ear of grain.

Irrigation 3 — Jointing (60–65 DAS): Stem is elongating. The developing ear is inside the stem. Stress here = fewer grains per ear.

Irrigation 4 — Flowering (80–85 DAS): Most sensitive to water stress. Even 3 days of drought during flowering causes 15–20% yield loss. Do not skip.

Irrigation 5 — Grain Filling (100–105 DAS): Grains are swelling. Adequate water = heavy, plump grains.

Irrigation 6 — Dough stage (115–120 DAS): Only if soil is very dry. Avoid if rains have occurred.

Note: Stop all irrigation 15 days before harvest. Wet soil at harvest means lodging (crop falls over) and losses during cutting.`
        },
        {
          title: "Pest & Disease Control",
          icon: "🐛",
          duration: "Monitor weekly from 30 days onwards",
          tip: "Yellow Rust can wipe out 50% of a wheat field in 2 weeks during cool, cloudy weather. If you see orange-yellow powder on leaves, spray within 24 hours — not tomorrow.",
          detail: `Yellow Rust (most dangerous in cool, humid conditions):
— Identify: Bright yellow-orange powdery stripes along the length of leaves.
— Act immediately: Spray Propiconazole 25% EC at 25 ml per 10 litres of water. Repeat after 14 days if weather stays cool.
— Preventive: If variety is susceptible and weather is favourable, spray Tebuconazole at flag leaf stage even without symptoms.

Aphids (Mustard Aphid also attacks wheat):
— Identify: Small green or brown insects clustered on young leaves and ears.
— Threshold: 50+ aphids per tiller = action required.
— Spray Dimethoate 30% EC at 15 ml per 10 litres of water.

Termite attack (rare but severe):
— Identify: Plants wilt and pull out easily, roots have tunnels.
— Prevention: Treat soil with Chlorpyrifos 20% EC at 2.5 litres per acre mixed in 200 litres of water before sowing.`
        },
        {
          title: "Harvesting & Storage",
          icon: "🌾",
          duration: "105–120 days from sowing",
          tip: "Harvest when the ear is golden and the grain is hard. Pinch a grain — if it dents slightly but does not crush, moisture is around 14–16%. That is harvest time. Too early = soft grains. Too late = shatter losses.",
          detail: `Signs of harvest maturity:
— Leaves and stem have turned completely yellow
— Grains are hard and dry, not easily dented
— Grain moisture: 14–18%

Harvesting: Use a combine harvester for large fields — it harvests, threshes, and cleans in one pass. For small fields, cut with a sickle at the base of the stem, bundle, and stack in the field for 3–5 days to dry.

Threshing: If not using combine, use a threshing machine within 5 days. Manual threshing wastes 5–8% of grain from incomplete separation.

Cleaning: Pass the threshed grain through a winnower to remove chaff, broken grains, and dust. This improves storage life dramatically.

Drying: Spread on clean threshing floor, 5 cm thick layer. Dry until grain moisture drops to 12–13% — this is measured with a moisture meter (cheap, worth buying). Sun-dry for 3–5 days turning twice daily.

Storage: Store in clean, disinfected bags or metal bins. Place 3–4 Aluminium Phosphide (Celphos) tablets per tonne of grain in a sealed space to kill storage insects. Mark the date of storage on each bag.`
        }
      ],
      organicPlan: {
        soilPrep: "2–3 ploughings + rotavation + pre-sowing irrigation (palewa). Incorporate crop residue.",
        biofertilizer: "Azotobacter 500g + PSB (Phosphate Solubilising Bacteria) 500g per acre mixed in 20 kg compost as seed coating",
        farmyardManure: "2 tonnes per acre mixed into top 15 cm at last ploughing",
        vermicompost: "200 kg per acre applied with basal dose",
        neem: "Neem cake 80 kg per acre — incorporated at sowing for termite control and slow N release"
      },
      waterPlan: [
        { stage: "Pre-sowing (Palewa)", days: "4–5 days before sowing", amount: "Light — field moisture only" },
        { stage: "Crown Root Init.", days: "20–22 DAS", amount: "Medium — 5 cm depth irrigation" },
        { stage: "Tillering", days: "40–45 DAS", amount: "Medium — 5 cm" },
        { stage: "Jointing", days: "60–65 DAS", amount: "Medium — 5 cm" },
        { stage: "Flowering", days: "80–85 DAS", amount: "Gentle — 4 cm critical" },
        { stage: "Grain Filling", days: "100–105 DAS", amount: "Light — 3 cm" },
      ]
    },

    cotton: {
      name: "Cotton",
      label: "cotton",
      icon: "🌸",
      suitNPK: { N: [60, 120], P: [30, 60], K: [40, 80] },
      regions: ["Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh", "Punjab", "Haryana", "Madhya Pradesh", "Rajasthan", "Karnataka"],
      seasons: ["Kharif"],
      water: "MEDIUM",
      suitabilityScore: 0,
      description: "White gold of India. High input, high reward. Needs careful pest management but the price is worth the effort.",
      farmerIntro: "Cotton and I have been fighting and winning together for 20 years. It is a demanding crop — like a stubborn child — but when it blooms white in October, all the hardship feels worth it. Let me prepare you for every challenge.",
      yield: "8–12 quintals lint per acre",
      nextCrops: ["wheat", "chickpea", "groundnut"],
      steps: [
        {
          title: "Land Preparation & Soil Management",
          icon: "🚜",
          duration: "2–3 weeks before sowing",
          tip: "Cotton's taproot goes 1.5–2 metres deep. Shallow ploughing is the enemy of cotton. Go deep or expect weak plants.",
          detail: `Cotton demands deep, well-drained soil. If you have black cotton soil (Vertisol), it is your best friend — just make sure drainage is excellent because water-logged cotton is dead cotton.

Deep ploughing: Plough 30–35 cm deep using a subsoiler if available, or at minimum 25 cm with a disc plough. This breaks any hard pan that forms after years of shallow tillage. Hard pan = roots that cannot go deep = drought-sensitive plants.

Cross ploughing: Plough again perpendicular to the first ploughing at 15 cm depth. Then harrow 2–3 times to break clods thoroughly.

Make ridges and furrows at 90–100 cm apart for planting (for Bt cotton) or 60–75 cm for desi cotton. Cotton is planted on ridges, not flat — this ensures drainage.

Add 2–3 tonnes of FYM per acre into the soil during the last ploughing. Mix 25 kg neem cake per acre to control soil-borne nematodes — a major but invisible enemy of cotton.`
        },
        {
          title: "Seed Selection & Sowing",
          icon: "🌱",
          duration: "May 15 – June 15 (before monsoon) or June–July (with monsoon)",
          tip: "Do not sow cotton seed deeper than 3–4 cm. I have seen farmers push seed 8 cm deep thinking more is better. The seedling runs out of energy before it reaches sunlight.",
          detail: `Seed selection: Use certified Bt cotton hybrid seed (approved by State Agriculture Department). Popular hybrids: Bollgard-II varieties (BG-II technology) for bollworm resistance. Use non-Bt refuge seed (10% area) as mandated.

Seed treatment: Treat with Imidacloprid 70% WS at 5 grams per kg of seed for early sucking pest protection. Also treat with Trichoderma viride 4 g/kg for soil-borne disease protection.

Sowing method: Behind the plough in moist soil, drop 2–3 seeds per spot. After germination (7–10 days), thin to 1 healthy plant per spot. Final spacing: 90–100 cm between rows × 60–75 cm between plants for Bt cotton.

Best time: Sow when soil temperature is consistently 20°C or above. In rainfed areas, sow 7–10 days before onset of monsoon so germination benefits from first rain. Do not sow in dry soil and wait for rain — seeds rot or germinate unevenly.

Depth: 3–4 cm maximum. Use a dibbler (pointed stick) to make holes at exact spacing — much more accurate than broad-casting.`
        },
        {
          title: "Nutrient & Fertiliser Management",
          icon: "🧪",
          duration: "Split applications through the season",
          tip: "Cotton's biggest need is Potassium. Most Indian farmers under-apply K. Without K, bolls fall before they open. Use MOP generously.",
          detail: `Basal dose (at sowing): 
— FYM 2 tonnes per acre
— DAP 50 kg per acre (provides P for root establishment)
— MOP 30 kg per acre (K for stem strength)

First top-dressing (30–35 days after sowing, square formation):
— Urea 35 kg per acre. Apply in furrows beside the plant row, 10 cm away from stem. Cover with soil. Do not apply against the stem — it burns.

Second top-dressing (55–60 DAS, at boll formation):
— Urea 30 kg per acre
— MOP 15 kg per acre (extra K for boll development and retention)

Boron spray (when first flowers appear): Mix 1 gram Borax in 1 litre water and spray on flowers and young bolls. Boron dramatically reduces boll shedding — a common problem that frustrates cotton farmers. I started boron sprays in 2015 and my boll retention improved by 25%.

Foliar nutrition at boll filling: Spray 2% DAP solution (200 g DAP in 10 litres water) on leaves twice during boll filling stage. Drives nutrients directly to bolls.`
        },
        {
          title: "Pest Management — The Big Battle",
          icon: "🐛",
          duration: "Weekly scouting from day 30 — this never stops",
          tip: "Cotton has 162 known insect pests. But 95% of your losses will come from just 5. Know those 5. Scout weekly. Act at the threshold, not after damage.",
          detail: `The 5 major pests to know:

1. Bollworm (American, Spotted, Pink): Bt cotton controls American and Spotted bollworm. For Pink bollworm — install pheromone traps (5 per acre). If you see pink larvae in bolls at harvest, treat next year's seeds with Spinosad.

2. Whitefly (worst enemy of Bt cotton): Tiny white flies under leaves. They spread leaf curl virus. At 6–10 per leaf (threshold), spray Diafenthiuron 50% WP at 15 grams per 10 litres. Rotate chemicals every spray — whitefly develops resistance fast.

3. Jassids/Aphids: Curling of leaves, yellow patches. Spray Imidacloprid 17.8% SL at 3 ml per 10 litres or Thiamethoxam 25% WG at 2 grams per 10 litres.

4. Thrips (in dry conditions): Scratching marks on leaves, distorted young leaves. Spray Fipronil 5% SC at 20 ml per 10 litres.

5. Mealybug: White cottony masses at leaf axils and stem junctions. Release Cryptolaemus montrouzieri (a ladybird predator) — 10 beetles per acre. This is the organic/biological control. Chemical: Profenofos 50% EC at 20 ml per 10 litres.

General rule: Spray in morning or evening — never at midday. Rotate chemical groups each spray. Use a knapsack sprayer and ensure coverage under the leaf where most pests hide.`
        },
        {
          title: "Irrigation & Water Stress Management",
          icon: "💧",
          duration: "Critical stages — do not miss these",
          tip: "Cotton can tolerate drought better than most crops. But flowering and boll filling are completely non-negotiable. Water stress during those 6 weeks is permanent yield loss.",
          detail: `Cotton is relatively drought tolerant — but with targeted irrigation, yield doubles.

Irrigation 1 — Seedling stage (if dry): Light irrigation 10–15 DAS only if soil has gone completely dry. Too much early water causes weak, shallow root system. Roots should search for water — that makes them deep and drought-proof.

Irrigation 2 — Squaring (30–40 DAS): Squares (tiny buds) are forming. Moderate irrigation. Stress here reduces boll load.

Irrigation 3 — Flowering (50–65 DAS): Critical. A cotton flower lives for only 1 day. Water stress during flowering causes flower drop and empty bolls. Do not miss this.

Irrigation 4 — Boll Development (65–90 DAS): Boll expansion. Adequate water fills the boll. Stress = small bolls with less lint.

Boll filling to opening (90–120 DAS): Reduce irrigation. Excess water causes boll rot. Allow soil to dry between irrigations.

Irrigation method: Furrow irrigation is best for cotton — water flows along furrows between rows and wets the root zone without wetting the stem (prevents stem rot). Drip irrigation is even better — saves 40% water and increases yield by 20–25%.`
        },
        {
          title: "Picking & Post-Harvest",
          icon: "🌸",
          duration: "September–January, 3–5 pickings",
          tip: "Pick only fully opened white bolls. Half-open bolls give poor quality lint and attract rain damage. Never pick wet bolls — they clump and fetch 20% lower price. Wait for dew to dry.",
          detail: `Cotton picking in India is done by hand — 3 to 5 rounds of picking as bolls open progressively.

First picking (90–100 DAS): Only fully opened bolls. Do not be greedy and pick half-open bolls — they reduce quality.

Second picking (110–120 DAS): Main picking, largest volume.

Third and fourth pickings: At 130–140 and 150–160 DAS depending on variety.

Picking guidelines:
— Pick in the morning after dew dries (by 9–10 AM)
— Collect separately from different pickings — first picks have best quality
— Remove leaf trash, boll shells, and soil before collection
— Never mix cotton from different variety plots

Quality points that affect price:
— Staple length (fibre length) — longer is better
— Fibre strength
— Whiteness (avoid mixing yellow or discoloured bolls)
— Moisture content (below 8% for best price)

After final picking: Uproot plants and chop immediately. Do not leave standing — it harbours insects for next season. Deep plough within 2 weeks of final harvest.`
        }
      ],
      organicPlan: {
        soilPrep: "Deep ploughing 30 cm + ridge-furrow preparation. Add FYM + neem cake.",
        biofertilizer: "Azospirillum 500g + PSB 500g per acre mixed with FYM at sowing",
        farmyardManure: "2–3 tonnes per acre incorporated at last ploughing",
        vermicompost: "300 kg per acre applied at squaring stage as side dressing",
        neem: "Neem cake 100 kg per acre at sowing (nematode control) + Neem oil 3% spray for early pest management"
      },
      waterPlan: [
        { stage: "Establishment", days: "0–15 DAS", amount: "Only if dry — light irrigation" },
        { stage: "Squaring", days: "30–40 DAS", amount: "Moderate furrow irrigation" },
        { stage: "Flowering", days: "50–65 DAS", amount: "Critical — generous irrigation" },
        { stage: "Boll Development", days: "65–90 DAS", amount: "Moderate irrigation" },
        { stage: "Boll Opening", days: "90–120 DAS", amount: "Reduce — alternate dry/wet" },
      ]
    },

    maize: {
      name: "Maize (Corn)",
      label: "maize",
      icon: "🌽",
      suitNPK: { N: [80, 150], P: [30, 60], K: [30, 60] },
      regions: ["Karnataka", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Bihar", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Maharashtra", "Himachal Pradesh"],
      seasons: ["Kharif", "Rabi", "Zaid"],
      water: "MEDIUM",
      suitabilityScore: 0,
      description: "Fastest growing major crop. Can be grown in all three seasons. Excellent for food, fodder, and starch industry.",
      farmerIntro: "Maize taught me patience and speed at the same time. It grows fast — 90 days and you are done — but every week matters. Miss a step and the whole season is compromised. I will give you every secret I know.",
      yield: "20–28 quintals per acre",
      nextCrops: ["wheat", "potato", "chickpea"],
      steps: [
        {
          title: "Land Preparation",
          icon: "🚜",
          duration: "1 week before sowing",
          tip: "Maize hates waterlogging. Even 48 hours of standing water at the seedling stage can kill 40% of plants. Drainage is everything.",
          detail: `Maize grows best in deep, well-drained loamy soil. If your field has clay patches where water collects — make drainage channels before sowing. This is non-negotiable.

Plough 20–25 cm deep. Maize roots go deep — they need loose soil to penetrate. After ploughing, give 2–3 harrowings to break clods to pea-size.

If the previous crop was rice or any paddy (wet-soil crop), the field may have a hardpan at 15 cm depth. Break this with a subsoiler before sowing maize.

Field should be level but with gentle slope (2–3%) for surface drainage. If perfectly flat, make small drainage furrows at 10 metre intervals.

Apply 2 tonnes FYM per acre during the last ploughing and incorporate thoroughly. If soil pH is below 5.5 (acidic), apply 1 tonne agricultural lime per acre and mix in — maize grows poorly in acidic soil.`
        },
        {
          title: "Seed Selection & Sowing",
          icon: "🌱",
          duration: "June–July (Kharif), October–November (Rabi)",
          tip: "Always use single cross hybrid seed from a certified company. Local open-pollinated varieties yield 40% less. The seed cost is ₹800 extra per acre — you recover it 10 times over in yield.",
          detail: `Recommended hybrids: NK-6240, DKC-9108, Bioseed-9681, Pioneer-30V92. Choose based on your region's recommendation from the state agriculture department.

Seed rate: 8–10 kg per acre for hybrids.

Seed treatment: Thiram 75% WP at 2.5 grams per kg + Carbendazim 50% WP at 1 gram per kg (mix together, apply dry). This protects against seed rot and early damping-off. After this treatment, also coat with Azospirillum 500g + PSB 500g per 10 kg seed.

Sowing method: Behind the plough or using a maize planter. 
— Row spacing: 60 cm between rows for Kharif, 50 cm for Rabi (winter sun is lower, closer rows get more light).
— Plant spacing: 20–25 cm between plants in the row.
— Depth: 4–5 cm.

Sow 2 seeds per spot — thin to 1 plant after 10 days. Do not leave 2 plants per spot — they compete and both yield poorly.`
        },
        {
          title: "Nutrient Management",
          icon: "🧪",
          duration: "Basal + 2 top-dressings",
          tip: "Maize is the most nitrogen-hungry crop per unit of yield. Never under-apply N. Yellowing maize is N-deficient maize and you are watching your yield disappear.",
          detail: `Maize needs 120–140 kg N, 50 kg P, and 40 kg K per acre (total).

Basal dose (at sowing): 
— DAP 50 kg per acre → full phosphorus dose
— MOP 25 kg per acre → full potassium dose  
— 1/3rd of urea: 35 kg per acre

First top-dressing (25–30 DAS, knee-high stage):
— Apply 35 kg urea per acre as a ring around each plant, 10 cm away. Cover with soil. Do not let urea touch the stem — white crystals against green stem = fertiliser burn.

Second top-dressing (45–50 DAS, tasseling/silking stage):
— This is the most critical top-dressing in maize. Tassel (male flower at top) and silk (female hair on cob) are forming.
— Apply 30 kg urea per acre.
— Optionally, spray 2% urea solution (200g urea in 10 litres water) on leaves — fastest way to deliver nitrogen to a deficient plant.

Zinc deficiency is extremely common in maize. If you see white stripes on young leaves, apply Zinc Sulphate 5 kg per acre as soil application, or 2.5 grams per litre as foliar spray.`
        },
        {
          title: "Irrigation",
          icon: "💧",
          duration: "8–10 irrigations in Rabi, 3–5 in Kharif (rain-supplemented)",
          tip: "The 3 days around silking are the most water-sensitive in all of maize farming. If the silk dries before pollen falls on it, no grain forms. I lost half my crop to 3 days of heat and drought at silk stage in 2014. I never forgot.",
          detail: `Critical irrigation stages:

Sowing: Pre-sowing irrigation if soil is dry. Germination requires moist soil.

Knee-high (25–30 DAS): Good root development needs moisture. Irrigate if no rain for 10 days.

Tasseling/Silking (50–60 DAS): THE MOST CRITICAL PERIOD. Silk (the fine hair on top of the cob) must be kept moist and turgid. Pollen falls on silk — this is fertilisation. Dry silk = missed fertilisation = blank cobs. If no rain, irrigate every 5–6 days during this window without fail.

Grain filling (65–80 DAS): Regular irrigation every 10–12 days. Water fills the grain kernels. Stress here gives small, shrivelled grain — low weight, low price.

Dough stage (80–90 DAS): Light irrigation. Maize begins to dry naturally.

Stop irrigation 15 days before harvest.`
        },
        {
          title: "Pest Control",
          icon: "🐛",
          duration: "Scouting from day 15 onwards",
          tip: "Fall Armyworm is a new pest in India since 2018. It eats the growing tip of the plant. If the growing tip is gone, the plant makes no cob. React within 48 hours of first sighting.",
          detail: `Fall Armyworm (FAW) — New & Critical:
— Identify: Caterpillar with inverted Y mark on head. 'Window-pane' holes in leaves. Frass (wet sawdust-like droppings) in the whorl.
— Action: At first infestation, pour 2 ml Chlorantraniliprole + 0.5 ml Lambda-cyhalothrin solution into the whorl. Or: Emamectin Benzoate 5% SG at 4 grams per 10 litres sprayed into whorl.
— Biological: Release egg parasitoid Telenomus remus (available at state bio-control labs).

Stem Borer:
— Identify: Entry hole in stem, dead heart, frass.
— Control: Same as above. Also: Granular insecticide (Phorate 10G) — 8 kg per acre in whorl at 20 DAS.

Aphids (in dense clusters on leaves):
— Spray Dimethoate 30% EC at 15 ml per 10 litres.

Downy Mildew (fungal — causes white downy growth on leaf underside):
— Spray Metalaxyl 35% WS at 2 grams per litre as preventive measure if weather is humid.`
        },
        {
          title: "Harvest & Drying",
          icon: "🌽",
          duration: "90–110 days from sowing",
          tip: "Harvest at 'physiological maturity' — the black layer at the base of the grain is visible when you pull a kernel off. This means the grain has stopped gaining weight. After this, you are just drying, not gaining yield.",
          detail: `Harvesting signals:
— Husks have turned yellow and dry
— Silks are completely dry and brown
— Grain moisture: 25–30% at harvest (too early = low weight, too late = stalk lodging)

Manual harvest: Twist the cob downward and pull away from stalk. Leave the husk partially on to protect during transportation.

Mechanical harvest: Use a maize combine harvester for large fields — it husks, shells, and cleans in one pass.

Shelling: Use a motorised maize sheller. Do not shell wet cobs — it crushes the grain.

Drying: Most important step. Maize must be dried to below 14% moisture for safe storage. Spread 5–8 cm thick on clean cemented floor. Turn twice daily. Sun-dry for 5–7 days. Use a moisture meter to verify — do not guess.

If drying on cob: Hang cobs in well-ventilated shed or bamboo-frame drying platforms. Allow 2–3 weeks for moisture to drop naturally. This traditional method preserves quality but takes time.

Storage: Store in gunny bags with fumigation (Aluminium Phosphide 1 tablet per 250 kg grain in sealed store). Check every 2 months for insect activity or moisture.`
        }
      ],
      organicPlan: {
        soilPrep: "Deep ploughing + drainage channels. Add lime if pH < 5.5.",
        biofertilizer: "Azospirillum 500g + PSB 500g per 10 kg seed as seed coating",
        farmyardManure: "2 tonnes per acre mixed at sowing",
        vermicompost: "250 kg per acre applied at knee-high stage as ring application",
        neem: "Neem cake 80 kg per acre at basal — controls soil pests and nematodes"
      },
      waterPlan: [
        { stage: "Germination", days: "0–10 DAS", amount: "Pre-sowing + gentle germination water" },
        { stage: "Knee-high", days: "25–30 DAS", amount: "Medium irrigation" },
        { stage: "Tasseling/Silking", days: "50–60 DAS", amount: "Critical — every 5–6 days" },
        { stage: "Grain Filling", days: "65–80 DAS", amount: "Regular every 10–12 days" },
        { stage: "Maturity", days: "80–90 DAS", amount: "Light — stop 15 days before harvest" },
      ]
    },

    tomato: {
      name: "Tomato",
      label: "tomato",
      icon: "🍅",
      suitNPK: { N: [80, 150], P: [40, 80], K: [60, 100] },
      regions: ["Andhra Pradesh", "Karnataka", "Maharashtra", "Tamil Nadu", "Uttar Pradesh", "Madhya Pradesh", "Gujarat", "Odisha", "West Bengal", "Bihar"],
      seasons: ["Kharif", "Rabi", "Zaid"],
      water: "MEDIUM",
      suitabilityScore: 0,
      description: "India's most grown vegetable. High value, high management. Get the pest control right and the returns are exceptional.",
      farmerIntro: "Tomato is the most emotional crop I grow. When prices are good, you feel like a king. When they crash, you want to cry. But with good management, you can lock in profit even in a bad market. Let me show you the entire process from nursery to market.",
      yield: "30–50 quintals per acre",
      nextCrops: ["onion", "garlic", "beans"],
      steps: [
        {
          title: "Nursery Preparation",
          icon: "🌱",
          duration: "25–30 days before transplanting",
          tip: "The nursery is where your entire crop's future is decided. A strong 25-day old seedling gives you 60% of your final yield advantage over a weak one. Never rush the nursery stage.",
          detail: `Prepare raised nursery beds: 1 metre wide, 15 cm raised, any convenient length. Mix equal parts — garden soil + FYM + coarse sand + vermicompost. This mixture drains well and is disease-free.

Drench the bed with Copper Oxychloride solution (3 grams per litre) one week before sowing to eliminate soil-borne damping-off fungus. This step is worth the effort — damping-off can kill 80% of seedlings in a nursery within days.

Seed treatment: Soak seeds in hot water (50°C) for 30 minutes to kill seed-borne bacteria. Then treat with Trichoderma viride 4g per kg seed.

Sowing: Make shallow lines 10 cm apart. Sow seeds at 1 cm spacing. Cover lightly with fine soil (just enough to hide the seed). Sprinkle water twice daily with a fine rose can — never a strong jet that displaces seeds.

Germination in 5–7 days. After 12 days, thin overcrowded seedlings — 2 cm between seedlings in the row. This prevents weak, leggy plants.

One week before transplanting, harden the seedlings: Gradually reduce water and increase sun exposure. Cover with shade net (50%) during peak afternoon hours. Hardening reduces transplanting shock by 50%.`
        },
        {
          title: "Main Field Preparation & Transplanting",
          icon: "🚜",
          duration: "1 week preparation + 1–2 days transplanting",
          tip: "Plant on raised beds or ridges, never on flat ground. Flat planting = collar rot. This single mistake kills more tomato crops than any pest or disease.",
          detail: `Prepare ridges 90–100 cm wide and 30–45 cm high for flat regions. In sloped fields, make raised beds across the slope to prevent soil erosion.

Apply 3 tonnes FYM per acre into the top 30 cm before bed formation. Mix 100 kg neem cake per acre as soil pest control.

For drip irrigation: Lay drip lines along the ridge top before transplanting. 2 laterals per bed, 40 cm apart, with 30 cm drippers at 2 LPH flow rate. Cover with silver-black mulch (silver facing up — reflects sunlight and repels whitefly; black below — suppresses weeds). Cut holes in mulch at 60 cm intervals for planting.

Transplanting: Transplant seedlings of 25–30 days age with 6–7 leaves. Transplant in late evening (5–7 PM) or cloudy weather. Never in midday sun.

Spacing: 60 cm between rows × 45–60 cm between plants. Make a small hole in mulch, plant seedling so the lowest leaf is above mulch level. Water immediately after planting.

Give light irrigation or drip for first 3 days (not heavy — light misting keeps soil cool and helps root establishment). Shade newly transplanted seedlings for 3 days with 50% shade net if weather is very hot.`
        },
        {
          title: "Staking & Training",
          icon: "🌿",
          duration: "20 days onwards — ongoing",
          tip: "Unstaked tomato is half a yield. Fruit that touches soil rots. Fruit that touches other fruit gets disease. Every tomato plant needs support. Use bamboo stakes or strings from an overhead wire.",
          detail: `Install bamboo stakes (1.5–2 metres tall) within 20 days of transplanting, before roots spread too far. Push stake 30 cm deep, 10 cm away from stem.

Use soft cloth strips or jute twine to tie the main stem to the stake. Tie in a figure-8 loop — tight on stake, loose on stem. Check and retie every 2 weeks as plant grows.

For overhead wire system (better for high-yield management): String horizontal galvanised wire at 2 metre height along the row. Hang vertical twine from wire to plant. Wind the plant stem around the twine as it grows (spiral training). This system holds more weight, allows better air circulation, and makes harvesting easier.

Pruning: Remove all suckers (side shoots growing in the V between stem and branch) up to the first flower cluster. After the first cluster, leave 2 suckers — 3 stems total. This is "3-stem training." 3-stem plants give 20–30% higher yield than unpruned plants, and fruits are larger and more uniform.

Topping: When plants reach 2 metres or have 8–10 flower clusters, pinch the growing tip (apical tip). This stops upward growth and pushes energy into fruit development.`
        },
        {
          title: "Fertiliser Management",
          icon: "🧪",
          duration: "Weekly fertigation or split soil applications",
          tip: "Tomato is the most responsive crop to fertigation (fertiliser through drip). With drip fertigation, you save 30% fertiliser and get 25% more yield. The investment in drip pays back in one season.",
          detail: `Schedule (per acre per week via drip fertigation):

Week 1–2 (establishment): 2 kg urea + 1 kg MOP in 100 litres water. Push via drip.
Week 3–4 (vegetative growth): 3 kg 19:19:19 (NPK complex). 
Week 5–6 (flowering): 3 kg 13:40:13 (high P and K, low N). This pushes flower set.
Week 7–8 (fruit set): 2 kg urea + 3 kg MOP (high K fills fruit).
Week 9–10 (fruit enlargement): 3 kg 0:0:50 (Sulphate of Potash). 

For farmers without drip:
Basal: 3 tonnes FYM + 50 kg DAP + 25 kg MOP + 25 kg urea.
Top-dress at 30 DAS: 50 kg urea.
Top-dress at 60 DAS: 25 kg urea + 25 kg MOP.
Foliar spray: 0.5% Boron at first flower; 0.2% MgSO4 (Magnesium Sulphate) if leaf interveinal yellowing is seen.`
        },
        {
          title: "Pest & Disease Control",
          icon: "🐛",
          duration: "Weekly scouting — critical from day 30",
          tip: "Tomato Leaf Curl Virus, spread by whitefly, can destroy 100% of your crop. There is no cure once infected. Your only weapon is preventing whitefly from entering. Install yellow sticky traps from day 1.",
          detail: `Priority pests and diseases:

Whitefly (virus vector — most dangerous):
— Install yellow sticky traps (10 per acre) from day 1 of transplanting.
— Spray Imidacloprid 17.8% SL at 3 ml per 10 litres alternating with Thiamethoxam at 2g per 10 litres every 10 days.
— Never spray same chemical twice in a row — resistance develops fast.

Fruit Borer (Helicoverpa armigera):
— Set pheromone traps (5 per acre) for monitoring.
— At 1 moth per trap per night, spray Chlorantraniliprole 18.5% SC at 3 ml per 10 litres.
— Or use SLNPV (Spodoptera litura Nuclear Polyhedrosis Virus) — biological control, 250 ml per acre.

Early Blight (brown target-like rings on lower leaves):
— Spray Mancozeb 75% WP at 25 grams per 10 litres every 10 days in humid weather.
— Provide good air circulation through pruning.

Bacterial Wilt (plant wilts suddenly, vascular system brown):
— No chemical cure. Prevention: Crop rotation (do not grow tomato/brinjal/pepper in same field for 3 years). 
— Treat seedlings with Pseudomonas fluorescens 10g per litre as dip before transplanting.`
        },
        {
          title: "Irrigation Schedule",
          icon: "💧",
          duration: "Regular throughout season",
          tip: "Blossom End Rot is not a disease — it is calcium deficiency caused by uneven watering. If the bottom of your tomato turns black and leathery, your irrigation is inconsistent. Fix the water schedule, not the chemistry.",
          detail: `Tomato needs consistent moisture — not waterlogged, not dry. Extreme fluctuations between wet and dry cause fruit cracking and blossom end rot.

With drip irrigation: 
— 0–15 DAS: 4–5 litres per plant per day
— 15–30 DAS: 6–8 litres per plant per day
— Flowering to fruit set: 8–10 litres per plant per day
— Fruit enlargement: 10–12 litres per plant per day
— Maturity to harvest: 6–8 litres per plant per day

Without drip (flood or basin irrigation):
— Irrigate every 5–7 days in winter, every 3–4 days in summer.
— Avoid wetting the stem — always irrigate in furrows between rows.
— After heavy rain, drain standing water within 2 hours — tomato roots cannot survive waterlogging.

Mulching benefits: Silver-black mulch reduces irrigation need by 30%, maintains soil temperature, and eliminates soil splash (which causes early blight spread).`
        },
        {
          title: "Harvesting & Marketing",
          icon: "🍅",
          duration: "From 60–70 DAT, continuing for 2–4 months",
          tip: "For nearby markets — harvest at 90% colour (almost red). For distant markets — harvest at 'breaker stage' (pink on 10% of fruit). Tomato continues to ripen after picking. Timing is money.",
          detail: `Tomato ripening stages:
1. Mature Green: Full size but completely green. Do not harvest — premature.
2. Breaker: First pink/red colour break (10% colour). Harvest for markets 200+ km away.
3. Turning: 10–30% colour. For markets within 100 km.
4. Pink: 30–60% colour. Local market or processing.
5. Light Red/Red: 60–90% colour. Best eating quality, nearby market only.
6. Red: Full colour. Best table quality. Do not harvest for any commercial market.

Harvesting technique: Twist and pull gently. Do not crush or squeeze. Use clean hands or gloves. Place in plastic crates lined with newspaper — never throw into piles.

Grading: Sort by size, colour, and blemish. Grade A (large, uniform, blemish-free) fetches 20–30% premium. Remove all split, cracked, diseased fruit.

Post-harvest: Store at 12–15°C for up to 14 days (breaker stage). At room temperature, use within 3–5 days. Never store below 10°C — cold injury causes poor flavour.

Value addition: Consider selling to processing units (ketchup, paste factories) when market price is low — they pay based on dry matter content (Brix), not appearance. High-Brix tomatoes (Roma types) are preferred.`
        }
      ],
      organicPlan: {
        soilPrep: "Raised beds + silver-black mulch. Deep FYM incorporation + neem cake for nematodes.",
        biofertilizer: "Trichoderma + Pseudomonas fluorescens seedling dip before transplanting",
        farmyardManure: "3 tonnes per acre mixed at bed preparation",
        vermicompost: "300 kg per acre applied at 30 DAT as side dressing",
        neem: "Neem oil 0.3% spray every 15 days for early pest management + Neem cake 100 kg at soil preparation"
      },
      waterPlan: [
        { stage: "Establishment", days: "0–15 DAT", amount: "4–5 L/plant/day drip" },
        { stage: "Vegetative growth", days: "15–35 DAT", amount: "6–8 L/plant/day drip" },
        { stage: "Flowering", days: "35–55 DAT", amount: "8–10 L/plant/day drip" },
        { stage: "Fruit Enlargement", days: "55–80 DAT", amount: "10–12 L/plant/day drip" },
        { stage: "Harvest period", days: "60–120 DAT", amount: "6–8 L/plant/day drip" },
      ]
    },

    sugarcane: {
      name: "Sugarcane",
      label: "sugarcane",
      icon: "🎍",
      suitNPK: { N: [100, 200], P: [40, 80], K: [80, 150] },
      regions: ["Uttar Pradesh", "Maharashtra", "Karnataka", "Andhra Pradesh", "Tamil Nadu", "Gujarat", "Bihar", "Haryana", "Punjab", "Uttarakhand"],
      seasons: ["Kharif", "Rabi"],
      water: "HIGH",
      suitabilityScore: 0,
      description: "Long duration cash crop. 10–12 months of patience followed by guaranteed purchase from sugar mills. The ratoon system makes it very profitable.",
      farmerIntro: "Son, sugarcane is the crop for those with patience. You plant it and for 12 months you care for it like your own child. But the sugar mill never refuses to buy. In 22 years, I have never had a year where I could not sell sugarcane. That kind of security is rare.",
      yield: "300–400 quintals per acre",
      nextCrops: ["wheat", "potato", "mustard"],
      steps: [
        { title: "Land Preparation & Trench Making", icon: "🚜", duration: "2–3 weeks before planting", tip: "Sugarcane trenches should be exactly 25–30 cm deep and 30 cm wide. Deeper and shallower both cause problems. I use a rope as a depth gauge.", detail: "Deep ploughing 30–35 cm deep, then cross-ploughing, then harrowing 2–3 times. Make trenches 90 cm apart using a ridger. Trench should be 25–30 cm deep and 25–30 cm wide. Apply 3–4 tonnes FYM into the trenches, mixed with 50 kg neem cake per acre. Level the trench base evenly — uneven base means setts at different depths and uneven germination." },
        { title: "Sett Selection & Treatment", icon: "🌱", duration: "Prepare 2 days before planting", tip: "Always take setts from the top 1/3rd of the cane — those are young, active buds. Middle and bottom portions have older buds with lower germination.", detail: "Select healthy, disease-free mother cane of 8–10 months age. Cut into 2-budded setts (25–30 cm long) using a sharp sickle. Disinfect the cutter with 10% bleach solution before each cut to prevent disease transmission. Treat setts in Carbendazim 0.1% + Mancozeb 0.25% solution for 10 minutes. Drain and plant same day. Do not leave treated setts in sun — moisture evaporation reduces germination." },
        { title: "Planting & Fertiliser", icon: "🤲", duration: "October–November (Rabi) or February–March (Spring)", tip: "Place setts with buds facing sideways (3 and 9 o'clock position), not upward. Upward-facing buds get burned by sun and soil crust. Sideways buds push through soil sideways then turn upward naturally.", detail: "Place 2-budded setts end-to-end in the trench (no gaps). Cover with 5–7 cm soil — not too deep. Apply DAP 60 kg + MOP 50 kg + Zinc Sulphate 10 kg per acre as basal dose mixed in trench soil. First irrigation within 3 days to seal setts with moist soil. Germination begins in 8–15 days." },
        { title: "Nutrient Management", icon: "🧪", duration: "Split across the season", tip: "Sugarcane's N requirement is very high — 120–150 kg per acre total. Split into 4 doses. All at once causes excessive vegetative growth at expense of sugar content.", detail: "Split Urea application: 1/4th at planting, 1/4th at 45 DAP, 1/4th at 90 DAP, 1/4th at 120 DAP. Apply Potash (MOP) 50 kg at 60 DAP in addition to basal. Foliar spray of 2% Potassium Nitrate at 3–4 months stage improves sucrose content. Iron deficiency (yellowing of young leaves) — spray 0.5% Ferrous Sulphate (5g per litre) twice at 15-day interval." },
        { title: "Water Management", icon: "💧", duration: "16–18 irrigations over the season", tip: "Sugarcane needs more water than any other Indian crop. But waterlogging for more than 2 days at any stage reduces sugar content drastically. Good drainage + regular irrigation is the balance.", detail: "First irrigation within 3 days of planting. Thereafter irrigate every 7–10 days in winter, every 5–7 days in summer, and every 10–15 days during monsoon (only if dry spells occur). Critical stages requiring compulsory irrigation: germination (0–30 DAP), tillering (45–120 DAP), and grand growth period (120–270 DAP). Stop irrigation 3–4 weeks before harvest for dry stalks and higher sugar content." },
        { title: "Pest & Disease Control", icon: "🐛", duration: "Monthly scouting throughout", tip: "Early Shoot Borer (ESB) is the most damaging pest of young sugarcane. The first sign is 'dead heart' — the central shoot turns yellow and smells foul. React within 1 week or lose 20% of shoots.", detail: "Early Shoot Borer (0–120 DAP): Pour Chlorpyrifos 20% EC (2ml per litre) into the whorl where shoots emerge. Repeat at 30 and 60 DAP. Biological: Release Trichogramma chilonis egg cards (50,000 eggs per acre per week) from month 1. Pyrilla (leaf hopper): Spray Dimethoate or release Epiricania melanoleuca (parasitic wasp) — 5000 per acre. Red Rot disease (red internal staining of cane sections): No cure — rogue out infected plants immediately. Use disease-free seed material." },
        { title: "Harvest & Ratoon Management", icon: "🎍", duration: "10–12 months after planting", tip: "Harvest as close to the mill booking date as possible. Every week's delay after maturity reduces sugar recovery by 0.1%. But early harvest also reduces sugar. Know your mill's harvest schedule and plan accordingly.", detail: "Signs of maturity: Top leaves show 'spindle leaf' drying, rind becomes hard, gravity test shows high Brix (>18%). Cut at ground level with a sharp cane knife. Remove dried leaves and tops. Load within 24 hours — sugar content drops 0.2% per day after cutting. Ratoon management: After harvest, close the furrows, apply 1 tonne FYM + basal fertilisers, and manage ratoon crop for the next year — this saves replanting cost and often gives 70–80% of plant crop yield." }
      ],
      organicPlan: {
        soilPrep: "Deep ploughing + trench formation. Heavy FYM application into trenches.",
        biofertilizer: "Acetobacter 500g per acre mixed in FYM — specific N-fixer for sugarcane",
        farmyardManure: "3–4 tonnes per acre applied in trenches at planting",
        vermicompost: "500 kg per acre applied at 60 DAP as side dressing",
        neem: "Neem cake 100 kg per acre at planting to control soil pests"
      },
      waterPlan: [
        { stage: "Germination", days: "0–30 DAP", amount: "Every 7–8 days" },
        { stage: "Tillering", days: "30–120 DAP", amount: "Every 7–10 days" },
        { stage: "Grand Growth", days: "120–270 DAP", amount: "Every 5–7 days (summer)" },
        { stage: "Maturation", days: "270–360 DAP", amount: "Every 15 days" },
        { stage: "Pre-harvest", days: "Last 30 days", amount: "Stop — field must be dry" },
      ]
    },

    potato: {
      name: "Potato",
      label: "potato",
      icon: "🥔",
      suitNPK: { N: [80, 150], P: [40, 80], K: [80, 150] },
      regions: ["Uttar Pradesh", "West Bengal", "Bihar", "Punjab", "Gujarat", "Madhya Pradesh", "Himachal Pradesh", "Uttarakhand", "Karnataka"],
      seasons: ["Rabi", "Zaid"],
      water: "MEDIUM",
      suitabilityScore: 0,
      description: "High-return short-duration crop. Needs cool weather for tuber formation. One of India's most profitable crops when managed well.",
      farmerIntro: "I have grown potato for 18 winters. It is either your best crop or your worst nightmare — there is no middle ground. But with the right seed and the right timing, potato does not disappoint. Listen carefully.",
      yield: "100–140 quintals per acre",
      nextCrops: ["wheat", "maize", "rice"],
      steps: [
        { title: "Land Preparation", icon: "🚜", duration: "1–2 weeks before planting", tip: "Potato tubers grow underground. Any clod bigger than your fist is an obstacle that causes deformed potatoes. The soil must be finer than for any other crop.", detail: "Deep ploughing 25–30 cm. Then 3–4 harrowings until soil is completely fine. Potato tubers need loose, well-aerated soil to swell without restriction. Hard clods = misshapen potatoes with lower market value.\n\nIf possible, use a rotavator for final soil preparation — it creates the perfect friable, loose seedbed.\n\nAdd 3–4 tonnes FYM per acre incorporated into the top 20 cm. Potato is a heavy feeder and responds dramatically to organic matter.\n\nFormation of ridges: 60–75 cm apart. Potato is always planted on ridges — never flat. Flat planting causes tubers to turn green from sun exposure (green = toxic, unsaleable)." },
        { title: "Seed Selection & Treatment", icon: "🌱", duration: "Prepare 7–10 days before planting", tip: "Only use certified seed potato. Using market potato or your own saved seed for more than 2 seasons results in virus build-up and yield collapses. Certified seed is 40–60% of your total cost — do not cut corners here.", detail: "Seed rate: 10–12 quintals certified seed per acre. Choose variety by use: Kufri Jyoti/Kufri Pukhraj (table purpose), Kufri Chipsona-3 (chips/processing), Kufri Sindhuri (long shelf life).\n\nCut large seed tubers (>50g) into pieces with 2–3 eyes each. Dip cut surfaces in ash immediately to prevent rotting. Allow cut tubers to cure in shade for 5–7 days until cut surface forms a dry skin (suberization).\n\nTreat seed with Mancozeb 75% WP (2.5g per kg) + Imidacloprid 70% WS (3g per kg) before planting. Both applied dry as dust coating.\n\nIf using small tubers (<30g), plant whole without cutting — whole tubers have higher germination rate." },
        { title: "Planting", icon: "🤲", duration: "October 15 – November 15 (North India)", tip: "Plant exactly when soil temperature is 15–20°C. Above 25°C — tubers do not form. This is why timing in North India is critical. A week's delay in November costs you the cool window.", detail: "Plant in furrows on ridges, 30 cm apart within row. Depth: 8–10 cm — this is critical. Shallow planting leads to greening. Deep planting delays emergence and causes rotting in heavy soils.\n\nOrientation: Plant tubers with eyes (buds) facing upward. This reduces emergence time by 3–4 days.\n\nAfter planting, cover with loose soil and form a gentle ridge. Do not compact the soil over the seed — compacted soil prevents emergence and causes deformed tubers.\n\nGive a light irrigation immediately after planting to settle the soil around the seed." },
        { title: "Earthing Up & Hilling", icon: "🌿", duration: "25–30 DAS — one of the most important operations", tip: "Hilling is not optional. It is what separates a 100-quintal yield from a 50-quintal yield. You are providing space for tubers to form and preventing greening. Do it twice — once at 25 days and once at 45 days.", detail: "First earthing up (25–30 DAS): When plants are 15–20 cm tall, pull soil from the inter-row space up onto the ridge, increasing ridge height by 10–15 cm. Use a hoe or mechanical ridger.\n\nThis does several things: (1) Gives developing tubers more space to swell, (2) Covers any tubers that might green in sun, (3) Uproots weeds in the process, (4) Aerates the soil.\n\nSecond earthing up (45–50 DAS): Repeat the process. Final ridge should be 30–35 cm high and 40 cm wide at base.\n\nBefore second earthing up, apply the second dose of urea and potash as top-dressing in the furrow, then earth up to cover the fertiliser." },
        { title: "Fertiliser Management", icon: "🧪", duration: "Basal + 1 top-dressing", tip: "Potato needs more Potassium than any other nutrient. Low K = hollow heart (internal cavity in tuber), poor keeping quality, and susceptibility to bruising during harvest. Do not skimp on MOP.", detail: "Basal dose (at planting):\n— DAP 75 kg per acre\n— MOP 75 kg per acre\n— Urea 25 kg per acre\n\nTop-dressing (25–30 DAS, before first earthing up):\n— Urea 50 kg per acre\n— MOP 25 kg per acre\n\nFoliar spray at tuber initiation (45 DAS): Spray 0.5% Boron (5g Borax per litre) to improve tuber set and reduce internal brown spots.\n\nZinc Sulphate 5 kg per acre mixed at basal if soil is known to be zinc deficient (yellowing of leaves is a sign).\n\nCalcium: Potato skins crack (common scab increases) with low calcium. Lime 100 kg per acre at land preparation corrects this." },
        { title: "Pest & Disease Control", icon: "🐛", duration: "Weekly scouting — Late Blight is your enemy", tip: "Late Blight (Phytophthora infestans) caused the Irish Famine. It can destroy a field in 7–10 days in cool, wet conditions. In India's potato belt, this is your most dangerous enemy. Spray preventively — do not wait for symptoms.", detail: "Late Blight:\n— Identify: Water-soaked lesions on leaves that expand rapidly, white fuzzy growth on leaf underside, brown rot in tubers.\n— Prevention: Spray Mancozeb 75% WP 25g per 10 litres every 7–10 days when temperature is 15–22°C and humidity is >90%.\n— Curative: Metalaxyl + Mancozeb (Ridomil Gold) 25g per 10 litres at first symptom. Repeat in 7 days.\n\nEarly Blight (smaller, darker rings): Spray Chlorothalonil 75% WP 25g per 10 litres.\n\nAphids (virus vectors): Spray Imidacloprid 17.8% SL 3ml per 10 litres. More important: Aphid-free seed is the long-term solution.\n\nWhite Grubs (soil-borne larva eating tubers): Apply Chlorpyrifos 20% EC 500ml per acre in irrigation water.\n\nCutworms (stem cutting at soil level): Drench soil with Chlorpyrifos 20 ml per 10 litres at transplanting." },
        { title: "Harvest & Storage", icon: "🥔", duration: "70–90 DAS", tip: "Before harvesting, kill the haulm (tops) 10–15 days early by cutting or spraying. This hardens the skin and dramatically improves storage life. Un-skinned potatoes bruise and rot in storage.", detail: "Signs of maturity: Leaves turn yellow and dry. Tubers are full size. Skin does not peel when rubbed — firm skin means mature.\n\nHaulm killing: Cut tops 10–15 days before harvest OR spray Diquat 20% SL 500ml per acre. Dry haulm makes mechanical harvest easier and improves skin set.\n\nHarvesting: Use a potato digger (tractor-mounted) for large fields. For small fields, use a fork and hand-pick tubers. Dig when soil is dry — wet soil causes soil to stick to tubers and increases rotting.\n\nCuring: Place harvested tubers in a shaded, well-ventilated place for 10–15 days. Temperature 15–18°C, humidity 85–95%. This heals minor wounds and hardens the skin — dramatically extends storage life.\n\nStorage: Cold storage at 2–4°C for table purpose, 10–12°C for seed purpose. Seed potatoes stored too cold become 'chilling injured' and sprout weakly.\n\nFor no cold storage: Store in dry, dark, ventilated room. Cover with dry straw or jute bags. Check weekly and remove any rotting tubers before they spread." }
      ],
      organicPlan: {
        soilPrep: "Fine tilth + ridge formation. Heavy FYM. Lime if pH < 6.",
        biofertilizer: "PSB (Phosphate Solubilising Bacteria) 500g per acre mixed in FYM",
        farmyardManure: "3–4 tonnes per acre incorporated at last ploughing",
        vermicompost: "400 kg per acre applied at first earthing up",
        neem: "Neem cake 100 kg per acre at planting for soil pest control"
      },
      waterPlan: [
        { stage: "After planting", days: "Day 1–3", amount: "Light — settle soil around seed" },
        { stage: "Sprouting", days: "7–15 DAS", amount: "Moderate — keep soil moist" },
        { stage: "Tuber Initiation", days: "30–50 DAS", amount: "Critical — every 5–7 days" },
        { stage: "Bulking", days: "50–75 DAS", amount: "Regular — every 7–10 days" },
        { stage: "Pre-harvest", days: "Last 15 days", amount: "Stop completely" },
      ]
    },

    mustard: {
      name: "Mustard",
      label: "mustard",
      icon: "🌼",
      suitNPK: { N: [40, 80], P: [20, 40], K: [20, 40] },
      regions: ["Rajasthan", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "West Bengal", "Gujarat", "Punjab", "Bihar"],
      seasons: ["Rabi"],
      water: "LOW",
      suitabilityScore: 0,
      description: "Low-input oil seed crop. Best rotation partner for rice. Thrives in dry Rabi conditions with minimal irrigation.",
      farmerIntro: "Mustard is the honest poor man's crop. It needs very little — one or two irrigations, modest fertiliser, and it gives you oil and residue for cattle. I grow it between rice and wheat every year and it never lets me down.",
      yield: "5–7 quintals per acre",
      nextCrops: ["rice", "maize", "cotton"],
      steps: [
        { title: "Land Preparation", icon: "🚜", duration: "3–5 days", tip: "Mustard seedlings are tiny and fragile. Any clod bigger than a marble can prevent germination. The seedbed must be extremely fine.", detail: "2–3 ploughings + thorough harrowing. The seedbed must be very fine since mustard seeds are very small and need perfect seed-soil contact. Level the field carefully. Apply 1 tonne FYM per acre during preparation — mustard does not need heavy organic loading but benefits from some." },
        { title: "Sowing", icon: "🌱", duration: "October 1–25 (ideal window)", tip: "Timely sowing is the biggest yield factor in mustard — even bigger than fertiliser. After October 25, yield drops 50 kg per acre per day of delay.", detail: "Seed rate: 1.5–2 kg per acre (very small amount — expensive seeds). Varieties: PM-25, RH-749, Varuna for North India. Mix seed with equal weight dry sand for uniform sowing — without sand, the tiny seeds clump and sow too densely. Row spacing 30–45 cm. Depth 2–3 cm. Thin excess plants at 15–20 DAS to maintain 10–15 cm between plants within rows." },
        { title: "Fertiliser & Irrigation", icon: "🧪", duration: "Minimal — 1–2 irrigations", tip: "Sulphur is mustard's most critical micronutrient — it improves oil content by 2–3%. Most farmers miss this. Use Gypsum 50 kg per acre or Elemental Sulphur 10 kg per acre.", detail: "Basal: DAP 40 kg + Gypsum 50 kg + Urea 20 kg per acre. Top-dress urea 20 kg per acre at 25–30 DAS (flowering initiation). Irrigation 1 at 25–30 DAS (rosette/branching stage) — most critical. Irrigation 2 at 55–60 DAS (pod formation) — if available. That is all. Mustard survives and produces on 2 good rains if no irrigation is available — truly a drought-tolerant crop." },
        { title: "Pest Control", icon: "🐛", duration: "Monitor from 30 DAS", tip: "Aphids on mustard appear very suddenly and in huge numbers. If you see one plant with aphids today, the whole field may be infested in 3 days. Scout every 4–5 days in January–February.", detail: "Mustard Aphid (most critical pest): Yellow-green insects clustered on growing tips, flower stalks, and pods. At 10+ aphids per plant, spray Dimethoate 30% EC 15ml per 10 litres OR Imidacloprid 17.8% SL 3ml per 10 litres. Spray in morning. Avoid spraying during peak flowering (10 AM–4 PM) — kills pollinators (bees). Alternaria blight (black spots on leaves and pods): Spray Mancozeb 75% WP 25g per 10 litres at first appearance." },
        { title: "Harvest", icon: "🌼", duration: "95–110 DAS", tip: "Harvest when 75% of pods are straw-coloured — not when all are yellow. Waiting for 100% ripeness causes pod shattering — seeds fall to the ground. Shattering can mean losing 1–2 quintals per acre.", detail: "At 75% pod maturity (yellow-brown), cut the crop close to the ground. Bundle and stack in field for 4–5 days to dry. Thresh with a thresher or manually beat the bundles. Clean with a winnower. Sun dry until moisture drops to below 8%. Store in airtight bags or metal containers. Crush surplus into oil at local expeller — fresh mustard oil fetches premium in local markets." }
      ],
      organicPlan: {
        soilPrep: "Fine tilth. Light FYM. Sulphur application is essential.",
        biofertilizer: "Azotobacter 500g per acre mixed in soil at sowing",
        farmyardManure: "1 tonne per acre — light application is sufficient",
        vermicompost: "150 kg per acre at sowing",
        neem: "Neem oil 0.3% spray at first aphid sign — delays need for chemical spray"
      },
      waterPlan: [
        { stage: "Rosette/Branching", days: "25–30 DAS", amount: "Most critical irrigation" },
        { stage: "Pod formation", days: "55–60 DAS", amount: "Second irrigation if available" },
      ]
    },

    chickpea: {
      name: "Chickpea (Chana)",
      label: "chickpea",
      icon: "🫘",
      suitNPK: { N: [15, 30], P: [30, 60], K: [20, 40] },
      regions: ["Madhya Pradesh", "Rajasthan", "Uttar Pradesh", "Maharashtra", "Andhra Pradesh", "Karnataka", "Gujarat", "Bihar", "Haryana"],
      seasons: ["Rabi"],
      water: "LOW",
      suitabilityScore: 0,
      description: "Leguminous crop that fixes its own nitrogen. Excellent soil improver. Very low water and fertiliser requirement.",
      farmerIntro: "Chickpea is the crop that gives while taking very little. It fixes nitrogen from the air and leaves it in your soil for the next crop. I grow it every Rabi on 2 acres and my wheat after chickpea always yields better without any extra urea. That is the magic of legumes.",
      yield: "6–9 quintals per acre",
      nextCrops: ["wheat", "maize", "rice"],
      steps: [
        { title: "Land Preparation", icon: "🚜", duration: "3–5 days", tip: "Chickpea dislikes waterlogging more than almost any crop. If water stands for even 6 hours at the seedling stage, plants die from root rot. Drainage must be perfect.", detail: "2–3 ploughings + harrowing for good tilth. Drainage is critical — make drainage channels if field tends to waterlog. Apply 1 tonne FYM per acre. Chickpea prefers slightly alkaline soil (pH 6–8). If acidic, apply lime 500 kg per acre." },
        { title: "Seed Treatment & Sowing", icon: "🌱", duration: "October 15 – November 15", tip: "Rhizobium seed treatment is the single most important input for chickpea — more than any fertiliser. Rhizobium bacteria colonise the roots and fix atmospheric nitrogen. One packet (200g) treats 10 kg seed and gives the equivalent of 20 kg urea per acre — for free.", detail: "Seed rate: 30–35 kg per acre (Desi type), 40–50 kg for Kabuli. Varieties: JG-11, JG-74, Vijay (Desi); KAK-2, Pusa-1105 (Kabuli). Treat seed in shade (never sunlight) with Rhizobium japonicum 200g per 10 kg seed. Mix powder with jaggery solution (1%) for better adhesion. Allow to dry in shade for 30 minutes then sow. Apply Thiram 2.5g per kg after Rhizobium drying for disease protection. Sow 8–10 cm deep in rows 30 cm apart (Desi) or 45 cm (Kabuli)." },
        { title: "Fertiliser & Irrigation", icon: "🧪", duration: "Minimal", tip: "Never apply heavy nitrogen to chickpea. High soil N inhibits Rhizobium nodule formation — the nitrogen-fixing mechanism. If you over-fertilise with urea, you cancel the benefit of Rhizobium and waste money.", detail: "Basal: DAP 40 kg + MOP 15 kg per acre. That is all. No urea — the Rhizobium nodules fix all needed nitrogen. Chickpea usually needs no irrigation in Rabi if sowing is in moist soil. One protective irrigation at pod formation (50–60 DAS) if there is no winter rain. Two irrigations maximum in a season." },
        { title: "Pest & Disease Control", icon: "🐛", duration: "Monitor from 30 DAS", tip: "Pod Borer (Helicoverpa armigera) is responsible for 50–80% of chickpea yield loss in India. The caterpillar eats developing pods — you see the head of the caterpillar sticking out of the pod. Act at first sighting.", detail: "Pod Borer: Set pheromone traps (5 per acre) from day 45. At 8–10 moths per trap per night, spray Chlorantraniliprole 18.5% SC 3ml per 10 litres. Biological: Spray HNPV (Helicoverpa NPV virus) 250 ml per acre — it kills the caterpillar without harming bees. Wilt (Fusarium — sudden wilting with brown vascular system): No chemical cure. Prevention is everything. Use wilt-resistant varieties. 3-year rotation. Treat soil with Trichoderma viride 2.5 kg per acre before sowing." },
        { title: "Harvest", icon: "🫘", duration: "90–110 DAS", tip: "Harvest chickpea in the morning when there is slight dew — pods are less likely to shatter with some moisture. By midday the pods become brittle and every touch causes pod popping and seed loss.", detail: "Harvest when 90% pods are dry and brown. The plant itself will look brown and dry. Uproot or cut close to soil. Stack in field for 4–5 days. Thresh by beating on a hard surface or using a thresher. Clean with winnower. Dry in sun to 10–12% moisture. Store in airtight containers — weevils devastate chickpea in storage. Use Aluminium Phosphide 1 tablet per 250 kg in sealed storage." }
      ],
      organicPlan: {
        soilPrep: "Good tilth + drainage. Light FYM. Lime if acidic.",
        biofertilizer: "Rhizobium japonicum 200g per 10 kg seed — most critical input for this crop",
        farmyardManure: "1 tonne per acre — light organic matter",
        vermicompost: "100 kg per acre at sowing",
        neem: "HNPV biological spray for pod borer — safer than chemicals during pollination"
      },
      waterPlan: [
        { stage: "Pod formation", days: "50–60 DAS", amount: "One protective irrigation only" },
        { stage: "Rest of season", days: "All other stages", amount: "Rain-fed — no irrigation needed" },
      ]
    },

    groundnut: {
      name: "Groundnut (Peanut)",
      label: "groundnut",
      icon: "🥜",
      suitNPK: { N: [15, 30], P: [30, 60], K: [30, 60] },
      regions: ["Gujarat", "Andhra Pradesh", "Tamil Nadu", "Karnataka", "Rajasthan", "Madhya Pradesh", "Maharashtra", "Telangana", "Uttar Pradesh"],
      seasons: ["Kharif", "Rabi"],
      water: "MEDIUM",
      suitabilityScore: 0,
      description: "Oil seed and food crop with excellent export value. Nitrogen-fixer. Sandy loam soil is its best friend.",
      farmerIntro: "Groundnut is the crop where you plant above ground but harvest below ground. That always fascinates me. For 20 years in Gujarat, it has been my most profitable oil seed crop. Let me explain every step — especially the critical calcium application that most farmers miss.",
      yield: "10–14 quintals per acre (pods)",
      nextCrops: ["wheat", "maize", "chickpea"],
      steps: [
        { title: "Land Preparation", icon: "🚜", duration: "1 week", tip: "Groundnut pegs (the part that forms pods) push into soil from above ground. Hard soil = pegs cannot penetrate = no pods. The soil must be loose and friable to 20 cm depth.", detail: "Deep ploughing 25 cm + thorough harrowing. Sandy loam is ideal. Heavy clay soil prevents peg entry — if you have clay, mix coarse sand (5 tonnes per acre) to improve structure. The top 20 cm must be loose, crumbly, and free of stones — any hard object prevents peg entry and causes deformed pods. Add 1.5 tonnes FYM per acre at last ploughing." },
        { title: "Seed Preparation & Sowing", icon: "🌱", duration: "June 15 – July 15 (Kharif)", tip: "Shell groundnut seeds only 24 hours before sowing — not days earlier. Shelled kernels lose moisture rapidly and germination drops from 90% to 60% if stored shelled for more than 3 days.", detail: "Shell seeds 24 hours before sowing. Discard damaged, shrivelled, or discoloured kernels. Treat with Thiram 3g per kg + Rhizobium 200g per 10 kg seed (apply Rhizobium after Thiram dries). Seed rate: 50–55 kg kernels per acre. Row spacing: 30 cm (bunch type) or 45 cm (spreading type). Plant spacing: 10–15 cm within row. Depth: 5–6 cm. Do not sow in dry soil — germination fails. Sow when monsoon has established (July) for guaranteed germination." },
        { title: "Critical — Gypsum Application", icon: "🧪", duration: "30–35 DAS — do not miss this", tip: "Gypsum application at pegging stage is the most important and most missed operation in groundnut. Calcium from gypsum travels directly into forming pods. Without it, empty pods (no seeds inside) and 'pops' (hollow shells) are very common. This single step can add 2–3 quintals yield per acre.", detail: "Apply Gypsum 200 kg per acre as a broadcast around the plant base at 30–35 DAS (when pegs are entering the soil). Do not mix into soil — broadcast on surface and let rain or irrigation carry it in. Phospho-gypsum (by-product of fertiliser industry) is also effective and usually cheaper. Full fertiliser: Basal DAP 40 kg + MOP 25 kg at sowing. No urea needed — Rhizobium fixes nitrogen. Zinc Sulphate 5 kg per acre if soil is zinc deficient." },
        { title: "Irrigation", icon: "💧", duration: "4–5 irrigations in semi-arid regions", tip: "Pegging stage (30–45 DAS) and pod filling (60–80 DAS) are the two most critical periods. Water stress at pegging = pegs fail to enter soil. Water stress at pod filling = shrivelled kernels with low oil content.", detail: "Kharif groundnut is mostly rain-fed. Supplemental irrigations at: pegging (30–45 DAS), pod filling (60–80 DAS), and kernel development (80–100 DAS) if dry spells. Rabi groundnut needs 5–6 irrigations from sowing to harvest. Avoid irrigation during flowering (15–30 DAS) as it reduces flower retention. Stop irrigation 10–15 days before harvest for dry soil during digging." },
        { title: "Pest & Disease Control", icon: "🐛", duration: "Scout from 30 DAS", tip: "Late Leaf Spot and Tikka disease are the most yield-reducing diseases. They defoliate the plant before pods are filled. Preventive spray schedule matters more than reactive spraying.", detail: "Tikka/Leaf Spot: Spray Mancozeb 75% WP 25g per 10 litres at 30, 45, 60, 75 DAS as preventive schedule. Do not wait for heavy infection. Stem Rot (Sclerotium rolfsii — white fungal growth at soil level): Drench soil with Carbendazim 1g per litre around infected plants. Destroy and bury infected plant material. Aphids and Jassids (sucking pests): Spray Imidacloprid 17.8% SL 3ml per 10 litres once. Root Grubs (serious in some regions): Apply Chlorpyrifos 20% EC 2.5 litres per acre in last irrigation before sowing." },
        { title: "Harvest & Curing", icon: "🥜", duration: "90–120 DAS", tip: "Pull one plant and check pods — if 75% show orange-yellow inner shell colour (mesocarp colour), it is harvest time. Digging too early gives immature, low-oil kernels. Too late means pods stay in soil and you dig air.", detail: "Dig when 75–80% pods show orange-yellow mesocarp colour inside the shell. Use a digger or fork. Windrow the dug plants (roots facing up) in the field for 4–5 days to sun-dry. This is called 'curing' — it reduces moisture from 40% to 20% and prevents aflatoxin (dangerous fungal toxin) formation. After curing, strip pods from the plant by hand or machine thresher. Dry pods further until moisture drops to 8–9% for storage. Store in well-ventilated gunny bags. Do not store moist groundnut — aflatoxin contamination makes it unsaleable and toxic." }
      ],
      organicPlan: {
        soilPrep: "Deep loose tilth. Light FYM. Gypsum at pegging is critical.",
        biofertilizer: "Rhizobium 200g per 10 kg seed + Trichoderma soil drench at sowing",
        farmyardManure: "1.5 tonnes per acre incorporated at last ploughing",
        vermicompost: "200 kg per acre at pegging stage broadcast",
        neem: "Neem cake 80 kg per acre at sowing for soil pest control"
      },
      waterPlan: [
        { stage: "Establishment", days: "0–15 DAS", amount: "No irrigation needed (monsoon)" },
        { stage: "Pegging", days: "30–45 DAS", amount: "Critical if dry — light irrigation" },
        { stage: "Pod filling", days: "60–80 DAS", amount: "Critical if dry — moderate irrigation" },
        { stage: "Kernel development", days: "80–100 DAS", amount: "Light if dry" },
        { stage: "Pre-harvest", days: "Last 10–15 days", amount: "Stop — dry soil for digging" },
      ]
    }
  };

  /* ═══════════════════════════════════════════════════════════
     MATCHING ENGINE  — match crops to soil + region
  ═══════════════════════════════════════════════════════════ */
  function matchCrops(n, p, k, region) {
    const scores = [];
    Object.values(CROP_DB).forEach(crop => {
      let score = 0;
      const [nMin, nMax] = crop.suitNPK.N;
      const [pMin, pMax] = crop.suitNPK.P;
      const [kMin, kMax] = crop.suitNPK.K;

      // N score
      if (n >= nMin && n <= nMax) score += 40;
      else if (n >= nMin * 0.7 && n <= nMax * 1.3) score += 20;

      // P score
      if (p >= pMin && p <= pMax) score += 30;
      else if (p >= pMin * 0.7 && p <= pMax * 1.3) score += 15;

      // K score
      if (k >= kMin && k <= kMax) score += 20;
      else if (k >= kMin * 0.7 && k <= kMax * 1.3) score += 10;

      // Region score
      if (crop.regions.some(r => r.toLowerCase().includes(region.toLowerCase()) ||
        region.toLowerCase().includes(r.toLowerCase()))) score += 10;

      crop.suitabilityScore = Math.min(score, 100);
      if (score > 0) scores.push({ ...crop });
    });
    return scores.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  /* ══ Utility: Show / Hide stages ══ */
  function showStage(el) {
    [stage2, stage3, stage4].forEach(s => s.style.display = "none");
    el.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ══ Loading State ══ */
  function setLoading(on) {
    if (on) {
      btnAnalyse.classList.add("loading");
      btnAnalyse.querySelector(".btn-text").textContent = "Analysing Soil…";
    } else {
      btnAnalyse.classList.remove("loading");
      btnAnalyse.querySelector(".btn-text").textContent = "Get Plan";
    }
  }

  /* ══ Back Buttons ══ */
  btnBack2.addEventListener("click", () => showStage(stage2));
  btnBack3.addEventListener("click", () => showStage(stage3));

  /* ════════════════════════════════════════════════════════════
     STAGE 2 → STAGE 3: Form Submit
  ════════════════════════════════════════════════════════════ */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const n = parseFloat(document.getElementById("b-n").value);
    const p = parseFloat(document.getElementById("b-p").value);
    const k = parseFloat(document.getElementById("b-k").value);
    const region = document.getElementById("b-region").value;
    const water = document.getElementById("b-water").value;

    // Validation
    if (!n && n !== 0) return showError("Please enter a Nitrogen (N) value.");
    if (!p && p !== 0) return showError("Please enter a Phosphorus (P) value.");
    if (!k && k !== 0) return showError("Please enter a Potassium (K) value.");
    if (!region) return showError("Please select your State / Region.");
    if (n < 0 || p < 0 || k < 0) return showError("NPK values cannot be negative.");
    if (n > 300 || p > 200 || k > 300) return showError("NPK values seem too high. Please check your readings.");

    ctx = { N: n, P: p, K: k, region, water_source: water, season: getAutoSeason() };
    setLoading(true);

    // Simulate brief processing for UX
    setTimeout(() => {
      const matched = matchCrops(n, p, k, region);
      setLoading(false);
      if (matched.length === 0) {
        return showError("No crops matched your soil profile. Try adjusting your NPK values.");
      }
      renderStage3(matched);
      showStage(stage3);
    }, 600);
  });

  function showError(msg) {
    setLoading(false);
    // Remove old error if exists
    const old = document.querySelector(".form-error-toast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.className = "form-error-toast";
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #EF4444; color: #fff; padding: 14px 28px;
      border-radius: 100px; font-weight: 600; font-size: 15px;
      box-shadow: 0 8px 24px rgba(239,68,68,0.35);
      z-index: 9999; animation: slideUp 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  /* ════════════════════════════════════════════════════════════
     STAGE 3: Render Crop List
  ════════════════════════════════════════════════════════════ */
  function renderStage3(crops) {
    // NPK display
    npkDisplay.innerHTML = `
      <div class="npk-badge npk-n"><span class="npk-badge-key">N</span><span class="npk-badge-val">${ctx.N}</span></div>
      <div class="npk-badge npk-p"><span class="npk-badge-key">P</span><span class="npk-badge-val">${ctx.P}</span></div>
      <div class="npk-badge npk-k"><span class="npk-badge-key">K</span><span class="npk-badge-val">${ctx.K}</span></div>
      <div class="npk-badge" style="background:var(--primary-light);border:1px solid var(--primary);">
        <span class="npk-badge-key" style="color:var(--primary)">📍</span>
        <span class="npk-badge-val" style="color:var(--primary);font-size:15px">${ctx.region}</span>
      </div>
    `;

    cropCards.innerHTML = "";
    crops.forEach((crop, i) => {
      const card = document.createElement("div");
      card.className = "crop-rec-card glass-card" + (i === 0 ? " rank-1" : "");
      card.style.cursor = "pointer";
      card.style.transition = "transform 0.25s ease, box-shadow 0.25s ease";

      const scoreColor = crop.suitabilityScore >= 80 ? "#10B981" :
        crop.suitabilityScore >= 50 ? "#F59E0B" : "#6B7280";

      card.innerHTML = `
        <div class="crop-card-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:32px">${crop.icon}</span>
            <div class="crop-card-name">${crop.name}</div>
          </div>
          <span class="suitability-badge" style="background:${scoreColor}22;color:${scoreColor};border:1px solid ${scoreColor}44;">
            ${crop.suitabilityScore}% Match
          </span>
        </div>
        <p style="color:var(--text-muted);font-size:13px;font-weight:600;letter-spacing:0.05em;margin-bottom:12px;">
          ${crop.water} WATER &nbsp;·&nbsp; ${crop.seasons.join(" / ")} &nbsp;·&nbsp; ${crop.yield}
        </p>
        <p style="color:var(--text-secondary);font-size:14px;line-height:1.6;margin-bottom:20px;">${crop.description}</p>
        <div style="background:var(--bg-surface);border-radius:12px;padding:14px 16px;margin-bottom:20px;border:1px solid var(--border);">
          <p style="color:var(--text-muted);font-size:12px;font-weight:700;letter-spacing:0.08em;margin-bottom:6px;">IDEAL NPK RANGE</p>
          <p style="color:var(--text-secondary);font-size:13px;">
            N: ${crop.suitNPK.N[0]}–${crop.suitNPK.N[1]} &nbsp;|&nbsp;
            P: ${crop.suitNPK.P[0]}–${crop.suitNPK.P[1]} &nbsp;|&nbsp;
            K: ${crop.suitNPK.K[0]}–${crop.suitNPK.K[1]} kg/ha
          </p>
        </div>
        <button class="btn-analyse" style="margin-top:auto;padding:12px;width:100%;border-radius:12px;font-size:15px;">
          📋 View Full Growing Guide
        </button>
      `;

      card.addEventListener("mouseenter", () => { card.style.transform = "translateY(-4px)"; card.style.boxShadow = "0 16px 40px rgba(0,0,0,0.25)"; });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; card.style.boxShadow = ""; });
      card.addEventListener("click", () => loadStage4(crop.label, crop.name));
      cropCards.appendChild(card);
    });
  }

  /* ════════════════════════════════════════════════════════════
     STAGE 4: Full Farmer Guide — Step-by-Step Experience
  ════════════════════════════════════════════════════════════ */
  let currentStep = 0;
  let currentCrop = null;

  // loadStage4 and renderChapter are defined below (chapter wizard)


  /* ── Step-by-Step Navigator ─────────────────────────────── */
  function mountStepNavigator(crop) {
    const stepPanels = document.querySelectorAll(".step-panel");
    const stepDots = document.querySelectorAll(".step-dot");
    const btnNext = document.getElementById("stepBtnNext");
    const btnPrev = document.getElementById("stepBtnPrev");
    const stepCounter = document.getElementById("stepCounter");
    const stepProgressBar = document.getElementById("stepProgressBar");
    const totalSteps = crop.steps.length;

    function goTo(idx) {
      currentStep = Math.max(0, Math.min(idx, totalSteps - 1));
      stepPanels.forEach((p, i) => {
        p.style.display = i === currentStep ? "block" : "none";
        p.style.animation = i === currentStep ? "fadeSlideIn 0.4s ease" : "";
      });
      stepDots.forEach((d, i) => {
        d.classList.toggle("active", i === currentStep);
        d.classList.toggle("done", i < currentStep);
      });
      stepCounter.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
      stepProgressBar.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
      btnPrev.disabled = currentStep === 0;
      btnNext.textContent = currentStep === totalSteps - 1 ? "🌾 Finish" : "Next Step →";
      if (currentStep === totalSteps - 1) {
        btnNext.style.background = "var(--accent)";
      } else {
        btnNext.style.background = "";
      }
      window.scrollTo({ top: stage4.offsetTop - 80, behavior: "smooth" });
    }

    btnNext.addEventListener("click", () => {
      if (currentStep === totalSteps - 1) {
        document.getElementById("organicSection").scrollIntoView({ behavior: "smooth" });
      } else {
        goTo(currentStep + 1);
      }
    });

    btnPrev.addEventListener("click", () => goTo(currentStep - 1));
    stepDots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));

    goTo(0);
  }

  /* ── Build Growing Guide HTML ───────────────────────────── */
  function buildGuideHTML(crop) {
    const steps = crop.steps;

    const dotsHTML = steps.map((s, i) => `
      <div class="step-dot" data-step="${i}" title="${s.title}"></div>
    `).join("");

    const panelsHTML = steps.map((s, i) => `
      <div class="step-panel" data-index="${i}" style="display:none;">
        <div class="step-panel-inner">
          <!-- Step Header -->
          <div class="step-header">
            <div class="step-icon-wrap">${s.icon}</div>
            <div>
              <div class="step-label">Step ${i + 1} of ${steps.length}</div>
              <h3 class="step-title">${s.title}</h3>
              <div class="step-duration">⏱ ${s.duration}</div>
            </div>
          </div>

          <!-- Farmer's Tip -->
          <div class="step-tip-box">
            <div class="step-tip-label">🧓 Experienced Farmer's Tip</div>
            <p class="step-tip-text">"${s.tip}"</p>
          </div>

          <!-- Detailed Instructions -->
          <div class="step-detail">
            ${s.detail.split('\n\n').map(para => `<p>${para.trim()}</p>`).join('')}
          </div>
        </div>
      </div>
    `).join("");

    return `
      <style>
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-guide-wrap {
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .farmer-intro {
          background: linear-gradient(135deg, var(--primary) 0%, #166534 100%);
          padding: 32px 40px;
          color: #fff;
          font-size: 16px;
          line-height: 1.7;
          font-style: italic;
          position: relative;
        }
        .farmer-intro::before {
          content: '"';
          font-size: 120px;
          color: rgba(255,255,255,0.1);
          position: absolute;
          top: -20px;
          left: 20px;
          font-family: Georgia, serif;
          line-height: 1;
        }
        .farmer-intro-sig {
          margin-top: 16px;
          font-style: normal;
          font-weight: 700;
          font-size: 14px;
          color: rgba(255,255,255,0.8);
        }
        .step-progress-bar-wrap {
          padding: 20px 32px 0;
          background: var(--bg-raised);
        }
        .step-progress-bg {
          height: 4px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }
        .step-progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 4px;
          transition: width 0.4s ease;
        }
        .step-dots-row {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: center;
          padding: 16px 32px;
          flex-wrap: wrap;
          background: var(--bg-raised);
        }
        .step-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: var(--border);
          cursor: pointer;
          transition: all 0.25s;
          flex-shrink: 0;
        }
        .step-dot.active { background: var(--primary); transform: scale(1.4); }
        .step-dot.done { background: #10B981; }
        .step-counter {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 0 32px 12px;
          text-align: center;
          background: var(--bg-raised);
        }
        .step-panels-wrap {
          padding: 0 32px 32px;
          background: var(--bg-raised);
        }
        .step-panel-inner {}
        .step-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }
        .step-icon-wrap {
          font-size: 48px;
          line-height: 1;
          flex-shrink: 0;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-label {
          font-size: 12px;
          color: var(--primary);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .step-title {
          font-family: var(--font-display);
          font-size: 26px;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .step-duration {
          font-size: 13px;
          color: var(--text-muted);
          background: var(--bg-surface);
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          border: 1px solid var(--border);
        }
        .step-tip-box {
          background: #FFF8E7;
          border: 1px solid #F59E0B44;
          border-left: 4px solid #F59E0B;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 24px;
        }
        .step-tip-label {
          font-size: 12px;
          font-weight: 700;
          color: #B45309;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .step-tip-text {
          color: #78350F;
          font-size: 15px;
          line-height: 1.7;
          font-style: italic;
          font-weight: 500;
        }
        .step-detail p {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.9;
          margin-bottom: 16px;
        }
        .step-detail p:last-child { margin-bottom: 0; }
        .step-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          border-top: 1px solid var(--border);
          background: var(--bg-surface);
        }
        .step-nav-btn {
          padding: 14px 32px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .step-nav-btn-prev {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }
        .step-nav-btn-prev:hover { border-color: var(--primary); color: var(--primary); }
        .step-nav-btn-prev:disabled { opacity: 0.3; cursor: not-allowed; }
        .step-nav-btn-next {
          background: var(--primary);
          color: #fff;
          box-shadow: 0 4px 16px rgba(21,128,61,0.3);
        }
        .step-nav-btn-next:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(21,128,61,0.4); }

        @media (prefers-color-scheme: dark) {
          .step-tip-box { background: #292208; border-color: #F59E0B33; }
          .step-tip-label { color: #FCD34D; }
          .step-tip-text { color: #FDE68A; }
        }
        @media (max-width: 600px) {
          .farmer-intro { padding: 24px; }
          .step-panels-wrap { padding: 0 16px 24px; }
          .step-header { flex-direction: column; gap: 12px; }
          .step-nav { padding: 16px; }
          .step-nav-btn { padding: 12px 20px; font-size: 14px; }
        }
      </style>

      <div class="step-guide-wrap">
        <!-- Farmer Introduction -->
        <div class="farmer-intro">
          <p>${crop.farmerIntro}</p>
          <div class="farmer-intro-sig">— 20-Year Farmer, ${crop.regions[0]} Region</div>
        </div>

        <!-- Progress Bar -->
        <div class="step-progress-bar-wrap">
          <div class="step-progress-bg">
            <div class="step-progress-fill" id="stepProgressBar" style="width:0%"></div>
          </div>
        </div>

        <!-- Step Dots -->
        <div class="step-dots-row">${dotsHTML}</div>
        <div class="step-counter" id="stepCounter">Step 1 of ${steps.length}</div>

        <!-- Step Panels -->
        <div class="step-panels-wrap">${panelsHTML}</div>

        <!-- Navigation -->
        <div class="step-nav">
          <button class="step-nav-btn step-nav-btn-prev" id="stepBtnPrev" disabled>← Previous</button>
          <button class="step-nav-btn step-nav-btn-next" id="stepBtnNext">Next Step →</button>
        </div>
      </div>
    `;
  }

  /* ── Build Organic Plan HTML ────────────────────────────── */
  function buildOrganicHTML(crop) {
    const op = crop.organicPlan;
    const items = [
      { icon: "🌱", label: "Soil Preparation", value: op.soilPrep },
      { icon: "🦠", label: "Biofertilizer", value: op.biofertilizer },
      { icon: "🐄", label: "Farmyard Manure", value: op.farmyardManure },
      { icon: "🪱", label: "Vermicompost", value: op.vermicompost },
      { icon: "🌿", label: "Neem Application", value: op.neem },
    ];
    return items.map(item => `
      <div style="
        background: var(--bg-raised);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 24px;
        display: flex;
        gap: 16px;
        align-items: flex-start;
      ">
        <span style="font-size:28px;flex-shrink:0">${item.icon}</span>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">${item.label}</div>
          <div style="font-size:14px;color:var(--text-secondary);line-height:1.6;">${item.value}</div>
        </div>
      </div>
    `).join("");
  }

  /* ── Build Water Schedule HTML ──────────────────────────── */
  function buildWaterHTML(crop) {
    return crop.waterPlan.map(w => `
      <div style="
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 20px;
        background: var(--bg-raised);
        border: 1px solid var(--border);
        border-radius: 12px;
        margin-bottom: 12px;
      ">
        <div>
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">${w.stage}</div>
          <div style="font-size:13px;color:var(--text-muted);">${w.days}</div>
        </div>
        <div style="
          background: #EFF6FF; color: #1D4ED8;
          border: 1px solid #BFDBFE;
          padding: 6px 16px; border-radius: 100px;
          font-size: 13px; font-weight: 700;
          text-align: right; max-width: 200px;
        ">${w.amount}</div>
      </div>
    `).join("");
  }

  /* ── Build Rotation HTML ────────────────────────────────── */
  function buildRotationHTML(crop) {
    return crop.nextCrops.map(label => {
      const next = CROP_DB[label];
      if (!next) return "";
      return `
        <div class="rot-card glass-card" style="
          cursor: pointer; margin-bottom: 20px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 20px;
          transition: all 0.25s; padding: 24px 28px;
        "
        onmouseenter="this.style.borderColor='var(--primary)';this.style.transform='translateY(-2px)'"
        onmouseleave="this.style.borderColor='';this.style.transform=''"
        onclick="document.dispatchEvent(new CustomEvent('loadCrop',{detail:{label:'${label}',name:'${next.name}'}}))">
          <div style="display:flex;align-items:center;gap:16px;">
            <span style="font-size:40px">${next.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Rotation Option</div>
              <div style="font-family:var(--font-display);font-size:22px;color:var(--text-primary);margin-bottom:4px;">${next.name}</div>
              <div style="font-size:13px;color:var(--text-muted);">${next.water} water &nbsp;·&nbsp; ${next.seasons.join("/")} &nbsp;·&nbsp; ${next.yield}</div>
            </div>
          </div>
          <button class="btn-analyse" style="width:auto;padding:12px 24px;white-space:nowrap;flex-shrink:0;">
            Explore Process →
          </button>
        </div>
      `;
    }).join("");
  }

  // (loadCrop listener is registered at the bottom of the file)

  /* ════════════════════════════════════════════════════════════
     WATER SCHEDULE — inject into organic section header
     (We add it after organicSection since dashboard.html
     has the organic section — we append the water below it)
  ════════════════════════════════════════════════════════════ */
  const organicSection = document.getElementById("organicSection");

  // After organicGrid is populated, inject water schedule
  // ─── STAGE 4: 5-Chapter Farming Journey ─────────────────────

  let journeyChapters = [];   // 5 chapter objects from backend
  let currentChapter  = 0;    // 0–4

  const chapterPanel   = document.getElementById("chapterPanel");
  const btnChapterNext = document.getElementById("btnChapterNext");
  const btnChapterPrev = document.getElementById("btnChapterPrev");

  btnChapterNext.addEventListener("click", () => {
    if (currentChapter < journeyChapters.length - 1) {
      currentChapter++;
      renderChapter(currentChapter);
    } else {
      // On last chapter next = scroll back to crop list
      showStage(stage2);
    }
  });

  btnChapterPrev.addEventListener("click", () => {
    if (currentChapter > 0) {
      currentChapter--;
      renderChapter(currentChapter);
    }
  });

  async function loadStage4(cropLabel, cropName) {
    currentChapter = 0;
    if (stage4CropTitle) stage4CropTitle.textContent = cropName;

    // Transition UI
    stage3.style.display = "none";
    stage4.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (chapterPanel) {
      chapterPanel.innerHTML = `
        <div style="text-align:center; padding: 80px 0; color: var(--text-muted);">
          <div style="font-size:48px; margin-bottom:16px;">🌱</div>
          <p>Loading your farming journey for <strong style="color:var(--primary)">${cropName}</strong>...</p>
        </div>`;
    }

    try {
      const { N, P, K, region, water_source } = ctx;
      const url = `http://127.0.0.1:5000/api/crop-guide/${cropLabel}?area=1.0&mode=beginner&N=${N}&P=${P}&K=${K}`;
      const res  = await fetch(url);
      const data = await res.json();

      if (data.error) { alert("Could not load guide for " + cropName); return; }

      journeyChapters = data.farming_journey || [];
      if (!journeyChapters.length) { alert("No journey data found."); return; }

      renderChapter(0);

    } catch (err) {
      console.error(err);
      if (chapterPanel) {
        chapterPanel.innerHTML = `<p style="color:#ef4444; padding:40px;">Failed to load. Make sure the backend is running.</p>`;
      }
    }
  }

  // ── Update progress dots ──────────────────────────────────
  function updateProgress(idx) {
    const dots  = document.querySelectorAll(".cp-dot");
    const lines = document.querySelectorAll(".cp-line");
    dots.forEach((d, i) => {
      d.classList.remove("active", "done");
      if (i < idx)  d.classList.add("done");
      if (i === idx) d.classList.add("active");
    });
    lines.forEach((l, i) => {
      l.classList.toggle("done", i < idx);
    });
    if (btnChapterPrev) btnChapterPrev.style.display = idx === 0 ? "none" : "inline-flex";
    const nextBtn = btnChapterNext ? btnChapterNext.querySelector(".btn-text") : null;
    if (nextBtn) {
      nextBtn.textContent = idx === journeyChapters.length - 1 ? "Start Over ↺" : "Next Chapter →";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Render a single chapter ───────────────────────────────
  async function renderChapter(idx) {
    currentChapter = idx;
    updateProgress(idx);
    const ch = journeyChapters[idx];
    if (!ch || !chapterPanel) return;

    const stepsHtml = (ch.steps || []).map(s => `
      <div class="action-step">
        <div class="step-num-badge">${s.step}</div>
        <div class="step-body">
          <div class="step-title">${s.title}</div>
          <div class="step-detail">${s.detail}</div>
          ${s.highlight ? `<span class="step-highlight">${s.highlight}</span>` : ""}
        </div>
      </div>`).join("");

    const soilBanner = ch.soil_status ? `
      <div class="soil-status-banner">🧪 <strong>Your Soil Status:</strong> ${ch.soil_status}</div>` : "";

    let waterHtml = "";
    if (ch.water_schedule && ch.water_schedule.length) {
      const rows = ch.water_schedule.map(w => `
        <tr>
          <td><strong>${w.stage}</strong></td>
          <td>${w.days}</td>
          <td>${w.litres_per_plant_per_day != null
              ? w.litres_per_plant_per_day + " L/plant/day"
              : (w.litres_per_acre ? w.litres_per_acre.toLocaleString() + " L/acre" : "—")}</td>
        </tr>`).join("");
      waterHtml = `
        <h4 style="margin: 28px 0 4px; color:var(--blue-text); font-size:16px;">💧 Water Requirement by Stage</h4>
        <table class="water-schedule-table">
          <thead><tr><th>Stage</th><th>Duration</th><th>Water Needed</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    }

    const rotHtml = idx === 4 ? `
      <div class="rotation-next-label">
        <h3>Next Crop Recommendations</h3>
        <p id="rotationSeasonLabel">Computing optimal crops for your next season...</p>
      </div>
      <div class="rot-next-cards" id="rotNextCards">
        <div style="text-align:center; color:var(--text-muted); padding:24px;">Loading...</div>
      </div>` : "";

    chapterPanel.innerHTML = `
      <div class="chapter-num-badge">Chapter ${ch.number} of 5</div>
      <div class="chapter-header">
        <span class="chapter-icon">${ch.icon}</span>
        <h2 class="chapter-title">${ch.title}</h2>
      </div>
      <div class="farmer-quote">"${ch.mentor_quote}"</div>
      ${soilBanner}
      <div class="action-steps">${stepsHtml}</div>
      ${waterHtml}
      ${rotHtml}
      <div class="tip-box">${ch.tip}</div>`;

    if (idx === 4) {
      loadRotationCards(ch.next_crop_season, ch.harvest_month_name);
    }
  }

  // ── Load month-aware rotation cards ──────────────────────
  async function loadRotationCards(nextSeason, harvestMonth) {
    const labelEl = document.getElementById("rotationSeasonLabel");
    const cardsEl = document.getElementById("rotNextCards");
    if (labelEl) {
      labelEl.textContent = `Best crops to plant after your harvest in ${harvestMonth} — ${nextSeason} season`;
    }
    try {
      const { N, P, K, region, water_source } = ctx;
      const seqN = Math.max(0, N - 10);
      const seqP = Math.max(0, P - 5);
      const seqK = Math.max(0, K - 5);

      const res  = await fetch("http://127.0.0.1:5000/api/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ N: seqN, P: seqP, K: seqK, season: nextSeason, region, water_source, seasons_ahead: 3 })
      });
      const data = await res.json();

      if (!data.success || !data.rotation?.sequence?.length) {
        if (cardsEl) cardsEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:24px;">No rotation crops found for ${nextSeason} in your region.</p>`;
        return;
      }

      if (cardsEl) {
        cardsEl.innerHTML = data.rotation.sequence.map(s => `
          <div class="rot-next-card" data-label="${s.label}" data-name="${s.crop}">
            <div>
              <div class="rot-next-crop-name">${s.crop}</div>
              <div class="rot-next-ext">
                🗓 ${nextSeason} Season &nbsp;|&nbsp; ${s.post_crop_benefit}
              </div>
            </div>
            <button class="btn-analyse" style="width:auto;padding:10px 20px;font-size:14px;margin-top:0;">
              <span class="btn-text">Explore →</span>
            </button>
          </div>`).join("");

        cardsEl.querySelectorAll(".rot-next-card").forEach(card => {
          card.addEventListener("click", () => loadStage4(card.dataset.label, card.dataset.name));
        });
      }
    } catch (err) {
      console.error("Rotation load error:", err);
      if (cardsEl) cardsEl.innerHTML = `<p style="color:#ef4444; padding:24px;">Could not load rotation data.</p>`;
    }
  }

  // Wire up Back button
  if (btnBack3) {
    btnBack3.addEventListener("click", () => {
      stage4.style.display = "none";
      stage3.style.display = "block";
    });
  }

  // Listen for crop clicks from Stage 3
  document.addEventListener("loadCrop", (e) => loadStage4(e.detail.label, e.detail.name));

});