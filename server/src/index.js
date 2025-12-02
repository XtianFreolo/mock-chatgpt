import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import app from "./app.js";



dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Mock ChatGPT API is running" });
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
});
