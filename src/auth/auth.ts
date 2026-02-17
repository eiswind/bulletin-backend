import {Elysia, t} from "elysia"
import {dbPlugin} from "../db/plugin.js";
import {user} from "../db/schema.js";
import type {DrizzleDb} from "../db/types.js";
import {authModel} from "./model.js";
import {eq} from "drizzle-orm";


export const createAuthPlugin = (options: { db: DrizzleDb }) => {

    return new Elysia({name: 'auth', prefix: '/auth'})
        .use(dbPlugin(options.db))
        .use(authModel)
        .post('/register',
            async ({db, set, status, body}) => {
                const existingUser = await db().select().from(user).where(eq(user.username, body.username)).execute()
                if (existingUser && existingUser.length > 0) {
                    return status(409, 'Username already taken')
                }

                const result = await db().insert(user).values(body).returning()
                if (result && result.length === 1) {
                    return body
                }
                set.status = 500
                return
            },
            {
                body: 'UserDTO',
                response: {
                    200: 'UserDTO',
                    409: t.String(),
                    500: t.Void()
                }
                ,
                detail: {
                    tags: ['Auth'],
                    operationId: 'registerUser',
                    summary: 'Register a new user'
                }
            }
        )


}