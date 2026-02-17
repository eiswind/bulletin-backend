import {Elysia} from "elysia";
import {node} from "@elysiajs/node";
import openapi from "@elysiajs/openapi";
import type {DrizzleDb} from "./db/types";
import {createMessagesPlugin} from "./messages/messages";


export const createApp = (options: { db: DrizzleDb }) => {



    return new Elysia({adapter: node(), prefix: '/api'})
        .use(openapi())
        .use(createMessagesPlugin(options))
        .onError(({ code, status, error }) => {
            if (code === 'NOT_FOUND') return status(404, 'Not Found :(')
            if (code === 'VALIDATION') return status(500, error.message);
            console.error(error);
            return status(500, error);
        })

}


