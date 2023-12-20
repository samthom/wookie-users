import express, { Express } from "express";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";
import { jsonFormat } from "./morgan";
import Router from "routes/router";

function allowCrossDomain(_: express.Request, res: express.Response, next: express.NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, token, refreshtoken, authorization, apikey');
    res.header('Access-Control-Expose-Headers', 'token, refreshtoken, authorization, apikey');
    next();
};

export function configureExpressApp(app: Express, router: Router) {
    configureExpressMiddlewares(app)
    app.use("/api", router.router);
}

function configureExpressMiddlewares(app: Express) {
    app.use(express.json());
    app.use(allowCrossDomain)
    var accessLogStream = fs.createWriteStream(path.join('./logs/access.log'), { flags: 'a' });

    app.use(morgan(jsonFormat, { stream: accessLogStream }));
    app.use(morgan("dev", {}));
}

