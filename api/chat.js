// api/chat.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing OPENROUTER_API_KEY");
      return res.status(500).json({ reply: "Server missing API key" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-vercel-app.vercel.app",
        "X-Title": "Voice Bot"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful voice assistant." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    console.log("✅ OpenRouter API response:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ reply: "No response from AI." });
    }

    const reply = data.choices[0].message.content.trim();
    res.status(200).json({ reply });

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ reply: "Failed to connect to AI service." });
  }
}
