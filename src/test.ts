import { PgRepository } from "lib/pkg/wookie-pg";
import { config } from "dotenv";
import { resolve } from "path";
import pg from "pg";
import { Wookie, _collections } from "lib/pkg/wookie";

config({ path: resolve(".env") });
const pool = new pg.Pool({
    connectionString: process.env.DB
});


const repo = new PgRepository(pool);
const wookie = new Wookie(repo);

wookie.init().then();
