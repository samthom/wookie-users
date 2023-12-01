#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER wookieuser WITH PASSWORD 'secret';
    CREATE DATABASE wookie_user;
    CREATE DATABASE wookie_user_shadow;
    GRANT ALL PRIVILEGES ON DATABASE wookie_user TO wookieuser;
    GRANT ALL PRIVILEGES ON DATABASE wookie_user_shadow TO wookieuser;
EOSQL
