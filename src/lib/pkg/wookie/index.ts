'use strict';

export type CollectionDescription = ColumnDescription[];

export type ColumnDescription = {
    table_name: string;
    column_name: string;
    data_type: string;
}

export const enum _collections {
    ROLES = "roles",
    USERS = "users",
    FEATURES = "features",
}

export class Wookie {
    public features: Features;
    public roles: Roles;
    public users: Users;
    constructor(private _repo: WookieRepository) {
        this.features = new Features(this._repo);
        this.roles = new Roles(this._repo);
        this.users = new Users(this._repo);
    }

    public async init() {
        // Need to execute in this order avoid conflic with the references
        await this.features.init();
        await this.roles.init();
        await this.users.init();
    }
}


export class Features {
    constructor(private _repo: WookieRepository) { };

    public async init() {
        try {
            const coll = await this._repo.getCollection(_collections.FEATURES);
            if (coll.length == 0) {
                await this._repo.createCollection(_collections.FEATURES);
            }
        } catch (error) {
            throw new Error(`unable to initialize ${_collections.FEATURES} collection: ${error}`);
        }
    }
}

export class Users {
    constructor(public _repo: WookieRepository) { }

    public async init() {
        try {
            const coll = await this._repo.getCollection(_collections.USERS);
            if (coll.length == 0) {
                await this._repo.createCollection(_collections.USERS);
            }
        } catch (error) {
            throw new Error(`unable to initialize ${_collections.USERS} collection: ${error}`);
        }
    }
}

export class Roles {
    constructor(public _repo: WookieRepository) { }

    public async init() {
        try {
            const coll = await this._repo.getCollection(_collections.ROLES);
            if (coll.length == 0) {
                await this._repo.createCollection(_collections.ROLES);
            }
        } catch (error) {
            throw new Error(`unable to initialize ${_collections.ROLES} collection: ${error}`);
        }
    }
}

export interface WookieRepository {
    getCollection(collectionName: string): Promise<CollectionDescription>;
    createCollection(collection: _collections): Promise<boolean>;
}
