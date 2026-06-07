const express = require("express");
const router = express.Router();
require("dotenv").config({ path: "../.env" });

// POST /api/assistant
router.post("/", async (req, res) => {
    try {
        const { message, context = "" } = req.body;
        if (!message)
            return res.status(400).json({ success: false, error: "message required" });

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are a tech career advisor helping students and graduates. 
            Give practical, concise advice on skills, job roles, and career paths in tech.
            Context about the user: ${context}`
                    },
                    { role: "user", content: message }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";
        res.json({ success: true, data: { reply } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;