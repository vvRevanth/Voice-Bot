// api/chat.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are ChatGPT, a helpful assistant." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ reply: "AI did not return a valid response." });
    }

  } catch (err) {
    console.error("❌ AI Fetch Error:", err);
    res.status(500).json({ reply: "AI: Failed to connect to AI service." });
  }
}
