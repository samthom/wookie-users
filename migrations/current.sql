-- Enter migration here

drop type if exists userdeletionreason;
create type userdeletionreason as enum ('reported', 'user_action', 'bot_detected', 'admin_action');

create table if not exists user_credential (
    id serial,
    email varchar(30) not null,
    password text not null,
    username varchar(25),
    email_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    is_deleted boolean not null default false,
    primary key (email),
    unique (id, username)
);

create table if not exists user_meta (
    id serial,
    email varchar(30) not null,
    email_verified_time timestamptz,
    email_verificcation_queued_time timestamptz,
    email_verification_sent_time timestamptz not null default now(),
    deletion_time timestamptz,
    deletion_reason userdeletionreason,
    last_login_time timestamptz not null,
    last_login_ip cidr not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now (),
    primary key (email),
    foreign key (email) references user_credential
);

create table if not exists user_detail (
    id serial,
    email varchar(30) not null,
    name varchar(25),
    bio varchar(256),
    profile_picture varchar(100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (email),
    foreign key (email) references user_credential
);

-- insert into user_credential(email, password)
-- select num || '@wookie.com' as email, crypt('secret', gen_salt('bf')) as password from generate_series(1, 19999) num;
