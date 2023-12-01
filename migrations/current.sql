-- Enter migration here

create type userdeletionreason as enum ('reported', 'user_action', 'bot_detected', 'admin_action');

create table if not exists user_credential (
    id serial,
    email varchar(30) not null unique,
    password text not null,
    username varchar(25),
    email_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    is_deleted boolean not null default false,
    primary key(id),
    unique (id, username)
);

create table if not exists user_meta (
    id serial,
    email varchar(30) not null,
    email_verified_time timestamptz,
    email_verification_queued_time timestamptz not null default now(),
    email_verification_sent_time timestamptz,
    deletion_time timestamptz,
    deletion_reason userdeletionreason,
    last_login_ip cidr not null,
    created_at timestamptz not null default now(),
    udpated_at timestamptz not null default now(),
    primary key(id),
    unique (id, email),
    foreign key(email) references user_credential(email)
);

create table if not exists user_detail (
    id serial,
    email varchar(30) not null,
    name varchar(25),
    bio varchar(256),
    profile_picture varchar(100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key(id),
    unique (id, email),
    foreign key(email) references user_credential(email)
);

create table if not exists post (
    id serial,
    title varchar(256) not null,
    user_email varchar(30) not null,
    content text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key(id),
    foreign key(user_email) references user_credential(email)
)
