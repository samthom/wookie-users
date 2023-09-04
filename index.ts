import { Pool, PoolClient } from "pg";
import * as db from "zapatos/db";
import type * as s from "zapatos/schema";

const pool = new Pool({
    connectionString: Bun.env.DB
})

async function withDBClient<T>(fn: (client: PoolClient) => T): Promise<T> {
    const client = await pool.connect();

    try {
        const result = await fn(client);
        return result;
    } finally {
        client.release();
    }
}

const server = Bun.serve({
    port: Bun.env.PORT,
    development: (Bun.env.NODE_ENV === "development" ? true : false),
    fetch(req) {
        return serve(req);
    },
});

console.log(`Listening on http://localhost:${server.port}...`);

process.on("SIGTERM", async () => {
    console.info("SIGTERM signal received.");
    console.log("Closing http server.");
    server.stop();
    console.log("Http server closed.");
    console.log("Closing database connections.");
    await pool.end();
    console.log("Database connections closed.");
    process.exit(0);
})

async function serve(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (req.method == "GET") {
        switch (url.pathname) {
            case "/": {

            }
            default: {
                return new Response(`404`);
            }
        }
    } else if (req.method == "POST") {
        switch (url.pathname) {
            case "/signup": {
                return await signup(req);
            }
            default: {
                return new Response(`404`);
            }
        }
    }
    return new Response(`Bun!`);
}

async function signup(req: Request): Promise<Response> {
    let chunks = [];
    const stream = req.body;
    if (stream != null) {
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        let body = Buffer.concat(chunks);
        let payloadStr = body.toString();
        let payload = JSON.parse(payloadStr);
        const hashedPassword =  await Bun.password.hash(payload.password);
        const r = await withDBClient(c => 
            db.insert("users",
                {
                    email: payload.email,
                    password: hashedPassword,
                    createdat: db.sql<s.users.SQL>`now()`,
                    updatedat: db.sql<s.users.SQL>`now()`
                }, {
                returning: ["id"]
            }).run(c)
        );

        console.log(r.id);
        return new Response("Success!!");
    }
    return new Response(`No body found!`);
}
