import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, PersonGeneration  } from "@google/genai";

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
app.use(express.json());

app.post("/generate-text-and-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const promptToSend = `Create a visually striking image that represents the following scene:
${prompt}

Guidelines:

If people or characters are involved, clearly show their emotions, facial expressions, or reactions.
- Use modern digital aesthetics if relevant: glowing screens, social media feeds, memes, or notifications.
- Keep it visually coherent so it could exist as a single frame in a chaotic, doomscroll-style feed.
- The style should evoke real-life imagery or recognizable cultural aesthetics.
- If it helps clarify the mood or tone, you may *stylize it in the spirit of familiar media* (e.g., a frame reminiscent of a cartoon like Peppa Pig, or a cinematic news photo).
- Output as a realistic or slightly stylized image suitable for a GIF or illustration.
`;

    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: promptToSend,
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const imageUrl = `data:image/png;base64,${imageData}`;
      //console.log(imageUrl)
      res.json({ text: promptToSend, image: imageUrl });
  }}} catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Backend running...");
});
