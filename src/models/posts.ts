import type { Post } from "./types/model-types";
import { Pool } from "pg";
import { withDBClient } from "./db";
import * as db from 'zapatos/db';
import type * as s from "zapatos/schema";

const POST = "post"
export namespace posts {
    export async function create(pool: Pool, post: Post): Promise<number> {
        const r = await withDBClient(c =>
            db.insert(POST,
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

    export async function get(pool: Pool, author?: string): Promise<Post[]> {
        let where = {};
        if (author) where = { user_email: author };
        const r = await withDBClient(c =>
            db.select(POST, where).run(c), pool
        );

        let posts: Post[] = [];
        for (const post of r) {
            posts.push({
                title: post.title,
                content: post.content || "",
                user_email: post.user_email,
            })
        }

        return posts;
    }
}
