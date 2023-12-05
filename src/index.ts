import dotenv from "dotenv";
import fastify from "fastify";
import { resolve } from "path";
import { Pool } from "pg";
import { indexRoutes, postRoutes, signUpRoutes } from "routes/router";

dotenv.config({ path: resolve(__dirname, "../.env") });

const envToLogger = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            },
        },
    },
    production: true,
    test: false,
}

const server = fastify({
    logger: envToLogger[String(process.env.NODE_ENV)] ?? true
});

const pool = new Pool({
    connectionString: process.env.DB
})

pool.on("error", (err, _client) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
})


server.register(indexRoutes(), { prefix: "/" });
server.register(signUpRoutes(pool), { prefix: "/signup" });
server.register(postRoutes(pool), { prefix: "/posts" });



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
