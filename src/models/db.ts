import { Pool, PoolClient } from "pg";

export async function withDBClient<T>(fn: (client: PoolClient) => T, pool: Pool): Promise<T> {
    const client = await pool.connect();

    try {
        const result = await fn(client);
        return result;
    } finally {
        client.release();
    }
}
