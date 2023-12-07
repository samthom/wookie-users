import { readFileSync } from "node:fs";
import { Resolvers } from "../../generated/resolver-types";
import { Pool } from "pg";
import { Post } from "models/types/model-types";

export function resolvers(db: Pool): Resolvers {
    return {
        Query: {
            posts: () => getPosts(db),
        }
    }
}

export const typeDefs = readFileSync("./graphql/schema.gql", { encoding: 'utf-8' });


function getPosts(db: Pool): Post[] {
    return []
}  
