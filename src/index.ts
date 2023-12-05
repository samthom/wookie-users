import dotenv from "dotenv";
import { resolve } from "path";
import pg from "pg";
import express from "express";
import http from "node:http";

import { apolloServer, configureExpressApp } from "config/config";
import Router from "routes/router";

dotenv.config({ path: resolve(".env") });

const port = Number(process.env.PORT) || 4000

const pool = new pg.Pool({
    connectionString: process.env.DB
})

pool.on("error", (err, _client) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
})

const app = express();
const httpServer = http.createServer(app);
const apollo = await apolloServer(httpServer);

const router = new Router(pool)

configureExpressApp(app, apollo, router);

const server = await new Promise<http.Server>(resolve => {
    const s = httpServer.listen({ port });
    resolve(s);
});

console.log(`🚀 Server ready at http://localhost:${port}/`);


// Graceful shutdown of nodejs http server
process.on("SIGTERM", () => {
    console.info("SIGTERM signal received.");
    console.log("Closing http server.");
    server.close(async error => {
        if (error) {
            console.error("Error at server.close(): ", error);
        }
        try {
            console.log("Http server closed.");
            console.log("Closing database connections.");
            await pool.end()
            console.log("Database connections closed.");
            process.exit(0);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    })
})
