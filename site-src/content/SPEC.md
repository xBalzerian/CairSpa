# Service page content spec — CAIR SPA (cairspa.com)

Business facts (only use these; never invent others):
- CAIR SPA (Comprehensive Aesthetic Integrative Regeneration Spa), medical spa
- 20951 Brookhurst St, Ste 115, Huntington Beach, CA 92646. Phone (949) 688-5898. Mon–Fri 9 AM–6 PM.
- All services are performed under Tran Plastic Surgery (Dr. Tuan Tran, triple board-certified in plastic, reconstructive and hand surgery; practice at Suite 107 in the same building). You may mention this oversight; do NOT invent other staff names, credentials, years in business, client counts, awards, ratings or statistics.
- Free consultation. NO PRICES anywhere. Cost questions are answered as: price depends on the plan, exact quote given at a free consultation.
- Aerolase = Aerolase Neo medical laser (650-microsecond pulse technology; manufacturer describes it as designed for all skin types and tones). Do not claim a specific device model beyond "Aerolase" unless phrased generally.
- "Customized Facial" (never say HydraFacial — trademark; client renamed it).

Writing rules (YMYL medical content):
- Answer-first: the `intro` must directly answer "what is X and who is it for" in 2–3 plain sentences (this is what Google AI Overviews quote).
- Accurate, conservative, mainstream medical information. Typical ranges are fine ("results often last 3–4 months") but hedge ("often", "typically", "varies") and never guarantee results.
- No fabricated testimonials, before/after claims, stats, or "#1/best" claims. No "board-certified physicians" except Dr. Tran as stated.
- Use registered brand names only generically and with ® (e.g., "neurotoxins such as Botox®, Dysport® or Xeomin®") and do NOT state which brands CAIR SPA stocks.
- Plain, warm, confident tone. US English. Short paragraphs. No em dashes (use commas, colons or periods).
- Mention Huntington Beach naturally 1–3 times, not stuffed.
- Each page ~700–1000 words total across fields.

Output: one JSON file per service at site-src/content/services/<slug>.json, valid JSON (UTF-8), with EXACTLY these keys:
{
  "slug": "botox",
  "name": "Neurotoxin",                      // menu/card name
  "category": "injectables" | "skin" | "laser" | "wellness",
  "menuBlurb": "max 60 chars",
  "metaTitle": "max 60 chars, include 'Huntington Beach' and 'CAIR SPA'",
  "metaDescription": "140–155 chars, ends with free consultation CTA",
  "h1": "e.g. Neurotoxin Injections in Huntington Beach",
  "intro": "2–3 sentence answer-first paragraph",
  "quickFacts": [{"label":"Treatment time","value":"..."},{"label":"Downtime","value":"..."},{"label":"Results","value":"..."},{"label":"Sessions","value":"..."}],
  "whatIs": ["paragraph", "paragraph"],
  "goodFor": ["concern 1", "... 5–8 items"],
  "steps": [{"title":"Consultation","text":"..."},{"title":"...","text":"..."},{"title":"...","text":"..."}],
  "expect": {"before":"...","during":"...","after":"..."},
  "faqs": [{"q":"question ending with ?","a":"2–4 sentence answer"}],   // 6 FAQs incl. cost (no numbers), downtime, how long results last, does it hurt, who is a good candidate
  "related": ["slug","slug","slug"]           // from the full slug list below
}

Full slug list (use for "related"):
injectables: botox, dermal-fillers, sculptra, prp-hair-restoration, prf-under-eye
skin: facial, rf-microneedling, skin-rejuvenation
laser: aerolase, laser-hair-removal, skin-tag-removal, vein-treatment, acne-treatment, melasma-treatment, pigmented-lesions
wellness: iv-infusion, nad-therapy, weight-loss, thread-lift, exosome-therapy, hair-transplant

Existing (old) pages for reference only are at services/<slug>/index.html in the repo root. They contain unverified marketing claims; do not copy claims, stats or reviews from them.
