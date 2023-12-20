import { Pool, PoolClient } from "pg";
import { CollectionDescription, WookieRepository, _collections } from "../wookie/index";

export class PgRepository implements WookieRepository {

    // Todo: use postgres config for construct
    constructor(private _pool: Pool) { }


    async getCollection(collectionName: string): Promise<CollectionDescription> {
        const r = await withDBClient(client => {
            return client.query(describeTable(collectionName));
        }, this._pool);


        const result = r["rows"]
        return result as CollectionDescription;
    }

    async createCollection(collection: _collections): Promise<boolean> {
        await withDBClient(client => {
            return client.query(createQry[collection]);
        }, this._pool);

        return true;
    }

}


function describe(strings: TemplateStringsArray, table_name: string): string {
    return `${strings[0]}${table_name}${strings[1]}`;
}


function describeTable(table_name: string) {
    return describe`
select 
    table_name, 
    column_name,
    data_type
from
    information_schema.columns
where
    table_name = '${table_name}'
`

}

const createQry = {
    features: `
create table if not exists features (
    id serial,
    feature_name varchar(30) not null unique,
    privileges text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    is_deleted boolean not null default false,
    primary key(id)
);
`,
    roles: `
create table if not exists roles (
    id serial,
    role_name varchar(30) not null unique,
    privileges text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    is_deleted boolean not null default false,
    primary key(id)
);
`,
    users: `
create table if not exists users (
    id serial,
    email varchar(30) not null unique,
    password text not null,
    username varchar(25) unique,
    role varchar(30),
    is_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    is_deleted boolean not null default false,
    primary key(id),
    foreign key(role) references roles(role_name)
);
`
}

export async function withDBClient<T>(fn: (client: PoolClient) => T, pool: Pool): Promise<T> {
    const client = await pool.connect();

    try {
        const result = await fn(client);
        return result;
    } finally {
        client.release();
    }
}
