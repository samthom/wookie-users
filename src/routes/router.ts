import bcrypt from "bcrypt";
import express from "express";
import { Next, Request, Response } from "../lib/helpers/_express";
import { posts } from "../models/posts";
import { Post } from "../models/types/model-types";
import { users } from "../models/users";
import { Pool } from "pg";
import HttpStatusCode from "./http-status-codes";


export default class Router {
    public path = "/";
    public router = express.Router()
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
        this.init()
    }

    private init() {
        this.router.get(this.path, index())
        this.router.post(this.path + "signup", signup(this.db));
        this.router.get(this.path + "posts", getPosts(this.db));
        this.router.post(this.path + "posts", createPost(this.db));
    }
}


function index() {
    return async (_req: Request, res: Response<{}>) => {
        res.send("Welcome to Wookie user api.");
    }
}

interface SignupBody {
    email: string;
    password: string;
}


export function signup(pool: Pool) {
    return async (req: Request<SignupBody, {}, {}>, res: Response<{}>, _next: Next) => {

        try {
            const payload = req.body;
            const hashedPassword = await bcrypt.hash(payload.password, Number(process.env.SALT) | 8);
            await users.create(pool, { ...payload, password: hashedPassword });
            res.status(HttpStatusCode.CREATED).send("Created")

        } catch (error) {
            if (error.code == 23505) {
                res.status(400).send("Account already exist. Please signin.");
                return;
            }
            res.status(500).send("Something went wrong. Try after sometime.");
        }
    }

}

export function createPost(pool: Pool) {
    return async (req: Request<Post, {}, {}>, res: Response<{}>, _next: Next) => {
        try {
            const post = req.body;
            await posts.create(pool, post);
            res.status(HttpStatusCode.CREATED).send("Post created.");
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send("Something went wrong. Try after sometime.");
        }
    }

}

export function getPosts(pool: Pool) {
    return async (req: Request<Post, {}, {}>, res: Response<{}>, _next: Next) => {
        try {
            const post = req.body;
            await posts.create(pool, post);
            const result = posts.get(pool, "sam@wookie.com")
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send("Something went wrong. Try after sometime.");
        }
    }
}
