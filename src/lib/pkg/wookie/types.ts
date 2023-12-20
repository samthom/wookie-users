type privilege = string;
type privileges = privilege[];

type meta = {
    __version: string;
    created_at: Date;
    updated_at: Date;
}

type flags = {
    is_suspended: boolean;
    is_deleted: boolean;
    is_verified?: boolean;
}

export type Role = {
    role_name: string;
    privileges: privileges;
} & flags | meta;

export type User = {
    email: string;
    username?: string;
    password: string;
    role: string;
} & flags | meta;

export type Feature = {
    feature_name: string;
    privileges: privileges;
} & flags | meta;
