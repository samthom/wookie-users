import bcrypt from "bcrypt";
import { FastifyPluginCallback } from "fastify";
import { Pool, PoolClient } from "pg";
import * as db from 'zapatos/db';
import type * as s from "zapatos/schema";

interface SignupBody {
    email: string;
    password: string;
}

interface PostBody {
    title: string;
    user_email: string;
    content: string
}

interface IReply {
    200: { success: boolean };
    201: { success: boolean };
    '4xx': { error: string };
    '5xx': { error: string };
}

export function indexRoutes(): FastifyPluginCallback {
    return (server, _, done) => {
        server.get("/", async (_request, reply) => {
            reply.code(200).send("Hello There!");
        });
        done();
    }

}

async function withDBClient<T>(fn: (client: PoolClient) => T, pool: Pool): Promise<T> {
    const client = await pool.connect();

    try {
        const result = await fn(client);
        return result;
    } finally {
        client.release();
    }
}

export function signUpRoutes(pool: Pool): FastifyPluginCallback {
    return (server, _, done) => {

        server.post<{ Body: SignupBody, Reply: IReply }>("/", async (request, reply) => {
            try {
                const payload = request.body;
                const hashedPassword = await bcrypt.hash(payload.password, Number(process.env.SALT) | 8);
                const r = await withDBClient(c =>
                    db.insert("user_credential",
                        {
                            email: payload.email,
                            password: hashedPassword,
                            created_at: db.sql<s.user_credential.SQL>`now()`,
                            updated_at: db.sql<s.user_credential.SQL>`now()`,
                        },
                        {
                            returning: ["id"]
                        }).run(c), pool
                );

                request.log.info(`user created with id: ${r.id}`);
                reply.code(201).send({ success: true });

            } catch (error) {
                if (error.code == 23505) {
                    reply.code(400).send({ error: "Account already exist. Please signin." });
                    return;
                }
                request.log.error(error)
                reply.code(500).send({ error: "Something went wrong. Try after sometime." });
            }
        });
        done();

    }
}

export function postRoutes(pool: Pool): FastifyPluginCallback {
    return (server, _, done) => {

        server.post<{ Body: PostBody, Reply: IReply }>("/", async (request, reply) => {
            try {
                const post = request.body;
                const r = await withDBClient(c =>
                    db.insert("post",
                        {
                            ...post,
                            created_at: db.sql<s.post.SQL>`now()`,
                            updated_at: db.sql<s.post.SQL>`now()`
                        },
                        {
                            returning: ["id"]
                        }).run(c), pool
                );
                request.log.info(`post: ${r.id} created`);
                reply.code(201).send({ success: true });
            } catch (error) {
                request.log.error(error)
                reply.code(500).send({ error: "Something went wrong. Try after sometime." });
            }
        })

        done();
    }
}
