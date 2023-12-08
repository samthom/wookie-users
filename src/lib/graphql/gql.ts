import { readFileSync } from "node:fs";
import type { Resolvers } from "../../generated/resolver-types";
import { Pool } from "pg";
import type { Post } from "models/types/model-types";
import { posts } from "models/posts";

export function resolvers(db: Pool): Resolvers {
    return {
        Query: {
            posts: async (parent, args, contextValue, info) => {
                const author = args.author?.toString(); 
                const posts = await getPosts(db, author)
                return posts;
            }
        }
    }
}

export const typeDefs = readFileSync("./graphql/schema.gql", { encoding: 'utf-8' });


async function getPosts(pool: Pool, author?: string): Promise<Post[]> {
    const result = await posts.get(pool, author);
    return result;
}  
