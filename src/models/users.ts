import { UserCredential } from "./types/model-types";
import { Pool } from "pg";
import { withDBClient } from "./db";
import * as db from 'zapatos/db';
import type * as s from "zapatos/schema";


export namespace users {
    export async function create(pool: Pool, payload: UserCredential): Promise<number> {

        const r = await withDBClient(c =>
            db.insert("user_credential",
                {
                    ...payload,
                    created_at: db.sql<s.user_credential.SQL>`now()`,
                    updated_at: db.sql<s.user_credential.SQL>`now()`,
                },
                {
                    returning: ["id"]
                }).run(c), pool
        );

        return r.id;
    }
}
