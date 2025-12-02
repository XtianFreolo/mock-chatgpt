import request from "supertest";
import { expect } from "chai";
import app from "./app.js";
import pool from "./db.js";

describe("Auth API", () => {
    beforeEach(async () => {
        await pool.query("TRUNCATE messages RESTART IDENTITY CASCADE;");
        await pool.query("TRUNCATE users RESTART IDENTITY CASCADE;");
    });

    it("registers a new user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "test1@example.com", password: "password123" });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("user");
        expect(res.body).to.have.property("token");
        expect(res.body.user.email).to.equal("test1@example.com");
    });

    it("rejects duplicate email", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({ email: "dup@example.com", password: "password123" });

        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "dup@example.com", password: "password123" });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("error");
    });

    it("logs in with correct credentials", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({ email: "login@example.com", password: "password123" });

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "login@example.com", password: "password123" });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("user");
        expect(res.body).to.have.property("token");
    });

    it("rejects login with wrong password", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({ email: "wrong@example.com", password: "password123" });

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "wrong@example.com", password: "nope" });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("error");
    });
});
