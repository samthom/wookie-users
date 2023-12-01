import { FastifyPluginCallback } from "fastify";
import bcrypt from "bcrypt";
import * as db from 'zapatos/db';
import type * as s from "zapatos/schema";
import { Pool, PoolClient } from "pg";

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

export interface Routes {
    path: string;
    plugin: () => FastifyPluginCallback;
}

export class indexRoutes implements Routes {
    path = "/";

    public plugin(): FastifyPluginCallback {
        return (server, _, done) => {
            server.get("/", async (_request, reply) => {
                reply.code(200).send("Hello There!");
            });
            done();
        }

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

export class signupRoutes implements Routes {
    path = "/signup";

    constructor(public pool: Pool) { }
    public plugin(): FastifyPluginCallback {
        return (server, _, done) => {
            server.post<{ Body: SignupBody, Reply: IReply }>("/", async (request, reply) => {
                try {
                    const payload = request.body;
                    console.log(payload);
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
                            }).run(c), this.pool
                    );

                    // create JWT token and return for the next page
                    console.log(r.id);
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
}
