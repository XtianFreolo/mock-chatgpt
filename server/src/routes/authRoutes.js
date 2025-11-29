import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // check if user already exists
        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // insert user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
            [email, passwordHash]
        );

        const user = result.rows[0];

        // create JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.created_at,
            },
            token,
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const result = await pool.query(
            `SELECT id, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        const matches = await bcrypt.compare(password, user.password_hash);
        if (!matches) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.created_at,
            },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
