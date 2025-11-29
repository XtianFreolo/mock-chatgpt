import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Mock ChatGPT API is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
});
