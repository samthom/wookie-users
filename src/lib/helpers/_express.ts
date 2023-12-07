import Express from 'express';
import * as core from 'express-serve-static-core';

export interface Query extends core.Query { }

export interface Params extends core.ParamsDictionary { }

export interface Request<ReqBody = any, ReqQuery = Query, URLParams = Params>
    extends Express.Request<URLParams, any, ReqBody, ReqQuery> { }

export interface Response<ResBody> extends Express.Response {
    json: core.Send<ResBody, this>;
}

export interface Next extends core.NextFunction { }

export type ExpressRouteFunc<ReqBody, ReqQuery, URLParams, ResBody> = (req: Request<ReqBody, ReqQuery, URLParams>, res: Response<ResBody>, next?: Next) => void | Promise<void>;
