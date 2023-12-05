import { readFileSync } from "node:fs";
import { Resolvers } from "../../generated/resolver-types";

export type Book = {
    title: string;
    author: string;
}

const books: Book[] = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin'
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster'
    }
]

export const resolvers: Resolvers = {
    Query: {
        books: () => books,
    }
}

export const typeDefs = readFileSync("./graphql/schema.gql", { encoding: 'utf-8'});
