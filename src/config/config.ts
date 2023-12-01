// Not in use. For future refactor ideas
import fastify, { FastifyInstance } from "fastify";

const envToLogger = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            },
        },
    },
    production: true,
    test: false,
}

export class App {
    public server: FastifyInstance
    constructor(environment: string) {
        this.server = fastify({
            logger: envToLogger[environment] ?? true
        });
    }


    // starts the server with port
    public start(port: number) {
        this.server.listen({ port }, (err, address) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.info(`Server listening at ${address}`);
        });
    }
}
