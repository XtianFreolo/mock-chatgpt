import express from "express";
import pool from "../db.js";
import authRequired from "../middleware/authMiddleware.js";

const router = express.Router();

// Simple mock "ChatGPT" reply generator
function generateMockReply(userMessage) {
    const trimmed = userMessage.trim();

    if (trimmed.toLowerCase().includes("hello")) {
        return "Hi! I'm your mock ChatGPT. 😊 How can I help you today?";
    }

    if (trimmed.endsWith("?")) {
        return `That's a great question, shiiieeeeettt: "${trimmed}". If this were a real LLM, I'd give you a detailed answer. For now, I'm just a mock bot.`;
    }

    if (trimmed.toLowerCase().includes("help")) {
        return "Sure! You can ask me questions about this project, coding, or just send random text. I'm currently a rule-based mock bot.";
    }

    return `You said: "${trimmed}". I'm just echoing back for now, but this pipeline is ready for a real AI later.`;
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
