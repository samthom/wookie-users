
type email = string;

export type Post = modelMeta & {
    title: string;
    content: string;
    user_email: email;
}

type modelMeta = {
    id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export type UserCredential = modelMeta & {
    email: string;
    password: string;
    username?: string;
    email_verified?: boolean;
    is_deleted?: boolean;
}
