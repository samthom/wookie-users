import fastify from "fastify";
import dotenv from "dotenv";
import path, { resolve } from "path";
import { Pool, PoolClient } from "pg";
import bcrypt from "bcrypt";
import * as db from 'zapatos/db';
import type * as s from "zapatos/schema";
import * as fs from "node:fs";

dotenv.config({ path: resolve(__dirname, "../variables.env") });

const server = fastify({ logger: true });
const pool = new Pool({
    connectionString: process.env.DB
})

pool.on("error", (err, _client) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
})

interface SignupBody {
    email: string;
    password: string;
}

interface IReply {
    200: { success: boolean };
    201: { success: boolean };
    '4xx': { error: string };
    '5xx': { error: string };
}

async function withDBClient<T>(fn: (client: PoolClient) => T): Promise<T> {
    const client = await pool.connect();

    try {
        const result = await fn(client);
        return result;
    } finally {
        client.release();
    }
}

server.register(require("@fastify/static"), {
    root: path.join(__dirname, "../public"),
    prefix: '/public/',
})

server.get("/", async (_request, reply) => {
    // read file from the path
    const indexFile = fs.createReadStream(resolve(__dirname, "../public/index.html"));
    return reply.type("text/html").send(indexFile);
});

server.post<{ Body: SignupBody, Reply: IReply }>("/signup", async (request, reply) => {
    try {
        const payload = request.body;
        const hashedPassword = await bcrypt.hash(payload.password, Number(process.env.SALT) | 8);
        const r = await withDBClient(c =>
            db.insert("users",
                {
                    email: payload.email,
                    password: hashedPassword,
                    createdat: db.sql<s.users.SQL>`now()`,
                    updatedat: db.sql<s.users.SQL>`now()`,
                },
                {
                    returning: ["id"]
                }).run(c)
        );

        // create JWT token and return for the next page
        console.log(r.id);
        reply.code(201).send({ success: true });

    } catch (error) {
        if (error.code == 23505) {
            reply.code(400).send({ error: "Account already exist. Please signin." });
            return;
        }
        reply.code(500).send({ error: "Something went wrong. Try after sometime." });
    }
});

server.listen({ port: Number(process.env.PORT) | 8000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.info(`Server listening at ${address}`);
});

// Graceful shutdown of nodejs http server
process.on("SIGTERM", () => {
    console.info("SIGTERM signal received.");
    console.log("Closing http server.");
    server.close(() => {
        console.log("Http server closed.");
        // close database and other connection if exists
        // if pool is created delete the pool
        console.log("Closing database connections.");
        pool.end(() => {
            console.log("Database connections closed.");
            process.exit(0);
        })
    })
})
