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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
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

    // 🔍 Debug log (shows actual error if any)
    console.log("OpenRouter response:", JSON.stringify(data, null, 2));

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ reply: "Sorry, I didn't understand that." });
    }

    const reply = data.choices[0].message.content.trim();
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ reply: "Failed to connect to AI service." });
  }
}
