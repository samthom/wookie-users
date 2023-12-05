import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { Express } from "express";
import { resolvers, typeDefs } from "lib/graphql/gql";
import morgan from "morgan";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { jsonFormat } from "./morgan";

interface AppContext {
    token?: string;
}

export async function apolloServer(httpServer: http.Server): Promise<ApolloServer<AppContext>> {
    const apollo = new ApolloServer<AppContext>({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]

    })

    await apollo.start();

    return apollo;
}

function allowCrossDomain(_: express.Request, res: express.Response, next: express.NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, token, refreshtoken, authorization, apikey');
    res.header('Access-Control-Expose-Headers', 'token, refreshtoken, authorization, apikey');
    next();
};

export function configureExpressApp(app: Express, apollo: ApolloServer<AppContext>, router) {
    configureExpressMiddlewares(app)
    app.use("/", router.router);
    configureExpressWithApollo(app, apollo)
}

function configureExpressMiddlewares(app: Express) {
    app.use(express.json());
    app.use(allowCrossDomain)
    var accessLogStream = fs.createWriteStream(path.join('./logs/access.log'), { flags: 'a' });

    app.use(morgan(jsonFormat, { stream: accessLogStream }));
    app.use(morgan("dev", {}));
}

function configureExpressWithApollo(app: Express, apollo: ApolloServer<AppContext>) {
app.use(
    '/gql',
    /* cors<cors.CorsRequest>(), */
    /* express.json(), */
    expressMiddleware(apollo, {
        context: async ({ req }) => ({ token: req.headers.token }),
    }),
);
}
