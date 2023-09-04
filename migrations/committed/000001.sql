--! Previous: -
--! Hash: sha1:1dafa757e57303c9bd364fec5c7acb2b88ed63a1

-- Enter migration here
create table if not exists users (
    id serial,
    email varchar(30) not null,
    password varchar(80) not null,
    username varchar(25),
    createdAt timestamptz not null default now(),
    updatedAt timestamptz not null default now(),
    primary key (email),
    unique (id, username)
);

create table if not exists userDetails (
    id serial,
    email varchar(30) not null,
    name varchar(25),
    bio varchar(256),
    profilePicture varchar(100),
    createdAt timestamptz not null default now(),
    updatedAt timestamptz not null default now(),
    primary key (email),
    foreign key (email) references users
);
