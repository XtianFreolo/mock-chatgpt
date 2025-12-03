import express from "express";
import pool from "../db.js";
import authRequired from "../middleware/authMiddleware.js";

const router = express.Router();

// Simple mock "ChatGPT" reply generator; fake brain
// Simple mock "ChatGPT" reply generator; fake brain
function generateMockReply(userMessage) {
    const trimmed = userMessage.trim();
    const lower = trimmed.toLowerCase();

    // --- Topic-specific presets (check these first) ---

    // Football
    if (
        lower.includes("football") ||
        lower.includes("sit or start") ||
        lower.includes("draft pick")
    ) {
        return (
            "Look, I'm just a mock bot right now, but this is where you could plug in " +
            "a real stats API. For now: Rice is the best and Josh Allen is a terrorist 🏈"
        );
    }

    // Taylor Swift
    if (
        lower.includes("taylor swift") ||
        lower.includes("swiftie") ||
        lower.includes("eras tour")
    ) {
        return (
            "Ah, Taylor Swift 🎤.\n\n" +
            "She aiight, but Ariana Grande is better."
        );
    }

    // Your project
    if (
        lower.includes("this project") ||
        lower.includes("mock chatgpt") ||
        lower.includes("how was this built")
    ) {
        return (
            "This mock ChatGPT app is built with:\n" +
            "- React + Vite on the frontend\n" +
            "- Express + Node on the backend\n" +
            "- PostgreSQL for storing users and messages\n" +
            "- JWT for authentication and protected chat routes\n" +
            "- Mocha/Chai + Supertest for backend tests\n\n" +
            "It’s structured like a real ChatGPT-style app, just using simple rules instead of an actual LLM."
        );
    }

    // --- Generic conversational rules ---

    if (lower.includes("hello") || lower.includes("hi")) {
        return "Hi! I'm your mock ChatGPT. 😊 How can I help you today?";
    }

    if (trimmed.endsWith("?")) {
        return `That's a great question: "${trimmed}". If this were a real LLM, I'd give you a detailed answer. For now, I'm just a mock bot.`;
    }

    if (lower.includes("help")) {
        return "Sure! You can ask me questions about this project, coding, or just send random text. I'm currently a rule-based mock bot.";
    }

    // Fallback
    return (
        `You said: "${trimmed}".\n` +
        "I’m just echoing you right now, but this pipeline is ready for a smarter AI brain later."
    );
}


// GET /api/chat/history - get all messages for logged-in user
router.get("/history", authRequired, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, role, content, created_at
       FROM messages
       WHERE user_id = $1
       ORDER BY created_at ASC`,
            [req.user.id]
        );

        res.json({ messages: result.rows });
    } catch (err) {
        console.error("Chat history error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/chat - send a message, get mock reply
router.post("/", authRequired, async (req, res) => {
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
    }

    const userId = req.user.id;
    const trimmed = content.trim();

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Save user message
        const userResult = await client.query(
            `INSERT INTO messages (user_id, role, content)
       VALUES ($1, 'user', $2)
       RETURNING id, role, content, created_at`,
            [userId, trimmed]
        );

        // Generate mock reply
        const replyText = generateMockReply(trimmed);

        // Save assistant message
        const botResult = await client.query(
            `INSERT INTO messages (user_id, role, content)
       VALUES ($1, 'assistant', $2)
       RETURNING id, role, content, created_at`,
            [userId, replyText]
        );

        await client.query("COMMIT");

        res.status(201).json({
            messages: [userResult.rows[0], botResult.rows[0]],
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Chat POST error:", err);
        res.status(500).json({ error: "Server error" });
    } finally {
        client.release();
    }
});

export default router;
