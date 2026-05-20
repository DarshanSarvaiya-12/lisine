import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Basic safety check
if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in environment variables.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Lisine backend is running."
  });
});

// Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message;

    if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
      return res.status(400).json({
        reply: "- Error: message is required."
      });
    }

    const prompt = `
You are Lisine AI.

Rules:
- Answer only in point form.
- Keep answers simple, clear, and useful.
- Do not write long paragraphs.
- Use short bullet points.
- Be mobile-friendly in style.

User message:
${userMessage.trim()}
    `.trim();

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const reply = (result.text || "").trim();

    return res.json({
      reply: reply || "- No response received."
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    return res.status(500).json({
      reply: "- Server error.\n- Please try again later."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Lisine backend running on port ${PORT}`);
});
