import {Elysia} from "elysia";
import {node} from "@elysiajs/node";
import {type ElysiaOpenAPIConfig, openapi} from "@elysiajs/openapi";
import type {DrizzleDb} from "./db/types.js";
import {createMessagesPlugin} from "./messages/messages.js";
import {createAuthPlugin} from "./auth/auth.js";
import {createProfilePlugin} from "./profile/profile.js";
import {bearer} from "@elysiajs/bearer";
import jwt from "jsonwebtoken";
import {logger} from "@bogeychan/elysia-logger";


export const createApp = (options: { db: DrizzleDb }, basic: boolean = false) => {


    const openapispec: ElysiaOpenAPIConfig = basic ?
        {
            documentation: {
                info: {
                    title: 'The Bulletin Board API',
                    description: 'Handle with care',
                    version: '1.0.0'
                },

            }
        }
        :
        {
            documentation: {
                info: {
                    title: 'The Bulletin Board API with a little security',
                    description: 'Handle with care',
                    version: '1.0.0'
                },
                security: [{
                    bearer: []
                }],
                components: {
                    securitySchemes: {
                        bearer: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT'
                        }
                    }
                }
            }
        }


    const base = new Elysia({adapter: node()})
        .use(
            logger({
                level: 'info',
                transport: {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                    },
                },
            })
        )
        .use(openapi(openapispec))

    if (!basic) {
        return base.use(createSecureApi(options))
    }

    return base.use(createBasicApi(options))

}


const createBasicApi = (options: { db: DrizzleDb }) => {

    return new Elysia({adapter: node(), prefix: '/api'})
        .use(createMessagesPlugin(options))
}


const createSecureApi = (options: { db: DrizzleDb }) => {

    return new Elysia({adapter: node(), prefix: '/api'})
        .use(bearer())
        .guard(
            {
                beforeHandle({bearer, status}) {
                    if (bearer == null) return status(401, 'No bearer token provided')
                    try {
                        jwt.verify(bearer, 'verysecret')
                    } catch {
                        return status(401, 'Invalid bearer token')
                    }

                }
            },
            (app) =>
                app
                    .use(createMessagesPlugin(options))
                    .use(createProfilePlugin(options))
        )
        .use(createAuthPlugin(options))

}
