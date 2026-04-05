import express    from "express";
import cors       from "cors";
import fetch      from "node-fetch";
import path       from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app        = express();
const PORT       = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL   = "gemini-1.5-flash";
const SAVE_DIR       = path.join(__dirname, "saved_images");

if (!existsSync(SAVE_DIR)) mkdirSync(SAVE_DIR);

const ANALYSIS_PROMPT = `You are DermaWeb AI, a professional dermatology image analysis assistant.
Analyse the skin image provided and return ONLY a valid JSON object — no markdown fences, no extra text, no explanation.

Return exactly this JSON structure:
{
  "condition": "<primary condition name, e.g. Melanoma, Rosacea, Eczema, Acne, Normal Skin, etc.>",
  "confidence": <integer 0-100>,
  "severity": "<Normal | Mild | Moderate | Severe>",
  "summary": "<2-sentence plain English summary of findings>",
  "observations": ["<observation 1>", "<observation 2>", "<observation 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "urgency": "<Routine | Soon | Urgent>",
  "disclaimer": "This analysis is for informational and educational purposes only and does not constitute medical advice. Please consult a qualified dermatologist for diagnosis and treatment."
}

Rules:
- If the image is NOT a skin image, set condition to "Non-dermatological Image" and explain in summary.
- Be factual, clinical, and helpful.
- Return ONLY the JSON. No text before or after it.`;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static(__dirname));
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/saved",  express.static(SAVE_DIR));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status   : "ok",
    api_ready: Boolean(GEMINI_API_KEY),
    model    : GEMINI_MODEL,
    provider : "Google Gemini",
  });
});

// ── Serve index.html ──────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// ── Gallery endpoint ──────────────────────────────────────────────────────────
app.get("/gallery", (req, res) => {
  const { readdirSync } = await import("fs").catch(() => require("fs"));
  try {
    const { readdirSync } = await import("fs");
    const files = readdirSync(SAVE_DIR)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort()
      .reverse()
      .map(f => `/saved/${f}`);
    res.json({ images: files });
  } catch {
    res.json({ images: [] });
  }
});

// ── Analyse endpoint ──────────────────────────────────────────────────────────
app.post("/analyze", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY not set. Add it in Render → Environment Variables.",
    });
  }

  const { image, save } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Body must contain { "image": "<base64>" }' });
  }

  // ── Decode base64 ─────────────────────────────────────────────────────────
  let base64Data = image;
  let mimeType   = "image/jpeg";
  if (image.includes(",")) {
    const [header, data] = image.split(",");
    base64Data = data;
    const m = header.match(/data:([^;]+)/);
    if (m) mimeType = m[1];
  }

  // ── Save image (optional) ─────────────────────────────────────────────────
  let saved = false;
  if (save) {
    try {
      const ext   = mimeType.split("/")[1].replace("jpeg", "jpg");
      const fname = `derma_${Date.now()}.${ext}`;
      const buf   = Buffer.from(base64Data, "base64");
      writeFileSync(path.join(SAVE_DIR, fname), buf);
      saved = true;
      console.log(`[SAVED] ${fname}`);
    } catch (e) {
      console.warn("[WARN] Could not save image:", e.message);
    }
  }

  // ── Gemini Vision call (direct REST — no SDK) ─────────────────────────────
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(url, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: base64Data } },
            { text: ANALYSIS_PROMPT },
          ],
        }],
        generationConfig: {
          temperature    : 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err  = await geminiRes.json().catch(() => ({}));
      const code = geminiRes.status;
      if (code === 403) return res.status(401).json({ error: "Invalid Gemini API key." });
      if (code === 429) return res.status(429).json({ error: "Gemini quota exceeded. Try again later." });
      return res.status(500).json({ error: err?.error?.message || "Gemini API error." });
    }

    const apiData = await geminiRes.json();
    let raw = (
      apiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
    ).trim();

    // Strip accidental markdown fences
    raw = raw.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();

    const result = JSON.parse(raw);
    result.success  = true;
    result.saved    = saved;
    result.model    = GEMINI_MODEL;
    result.provider = "Google Gemini";

    return res.json(result);

  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "Could not parse Gemini response as JSON." });
    }
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// ── Fallback ──────────────────────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("━".repeat(52));
  console.log("  DermaWeb  |  Node + Gemini Vision (REST)");
  console.log("━".repeat(52));
  console.log(`  ✓  Server: http://localhost:${PORT}`);
  console.log(`  ✓  Key:    ${GEMINI_API_KEY ? "set" : "NOT SET ⚠"}`);
  console.log(`  ✓  Model:  ${GEMINI_MODEL}`);
  console.log("━".repeat(52));
});