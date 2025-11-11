// api/chat.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "Message cannot be empty." });
  }

  // Check API key
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing OPENROUTER_API_KEY");
    return res.status(500).json({ reply: "Server missing API key." });
  }

  try {
    // Call OpenRouter AI
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    // Debug logs
    console.log("OpenRouter API response:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ reply: "⚠️ AI did not return a valid response." });
    }

    const reply = data.choices[0].message.content.trim();
    res.status(200).json({ reply });

  } catch (error) {
    console.error("❌ AI Fetch Error:", error);
    res.status(500).json({ reply: "⚠️ Failed to connect to AI service." });
  }
}
