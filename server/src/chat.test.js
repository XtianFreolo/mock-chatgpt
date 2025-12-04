import request from "supertest";
import { expect } from "chai";
import app from "./app.js";
import pool from "./db.js";

async function registerAndLogin(email = "chatuser@example.com") {
    const res = await request(app)
        .post("/api/auth/register")
        .send({ email, password: "password123" });

    return res.body.token;
}

describe("Chat API", () => {
    beforeEach(async () => {
        await pool.query("TRUNCATE messages RESTART IDENTITY CASCADE;");
        await pool.query("TRUNCATE users RESTART IDENTITY CASCADE;");
    });

    after(async () => {
        await pool.end();
    });

    it("requires auth token for chat", async () => {
        const res = await request(app)
            .post("/api/chat")
            .send({ content: "hello" });

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property("error");
    });

    it("creates user and assistant messages", async () => {
        const token = await registerAndLogin();

        const res = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({ content: "hello there" });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("messages");
        expect(res.body.messages).to.have.length(2);

        const [userMsg, botMsg] = res.body.messages;

        expect(userMsg.role).to.equal("user");
        expect(userMsg.content).to.equal("hello there");

        expect(botMsg.role).to.equal("assistant");
        expect(botMsg.content).to.be.a("string");
    });

    it("returns chat history for a user", async () => {
        const token = await registerAndLogin();

        await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({ content: "hello 1" });

        await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({ content: "hello 2" });

        const res = await request(app)
            .get("/api/chat/history")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("messages");
        expect(res.body.messages.length).to.be.at.least(4); // 2 user + 2 bot
    });
});
