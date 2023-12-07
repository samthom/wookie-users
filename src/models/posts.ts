import { Post } from "./types/model-types";
import { Pool } from "pg";
import { withDBClient } from "./db";
import * as db from 'zapatos/db';
import type * as s from "zapatos/schema";

export namespace posts {
    export async function create(pool: Pool, post: Post): Promise<number> {
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
        return r.id;
    }
}
