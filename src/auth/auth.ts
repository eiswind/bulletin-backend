import {Elysia, t} from "elysia"
import {dbPlugin} from "../db/plugin.js";
import {user} from "../db/schema.js";
import type {DrizzleDb} from "../db/types.js";
import {authModel} from "./model.js";
import {eq} from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createAuthPlugin = (options: { db: DrizzleDb }) => {

    return new Elysia({name: 'auth', prefix: '/auth'})
        .use(dbPlugin(options.db))
        .use(authModel)
        .post('/register',
            async ({db, status, body}) => {
                const existingUser = await db().select().from(user).where(eq(user.username, body.username)).execute()
                if (existingUser && existingUser.length > 0) {
                    return status(409, 'Username already taken')
                }
                const hash = await bcrypt.hash(body.password, 10)
                body.password = hash;
                const result = await db().insert(user).values(body).returning()
                if (result && result.length === 1) {
                    return status(201, body)
                }
               return status(500, 'Something went wrong')
            },
            {
                body: 'UserDTO',
                response: {
                    201: 'UserDTO',
                    409: t.String(),
                    500: t.String()
                }
                ,
                detail: {
                    tags: ['Auth'],
                    operationId: 'registerUser',
                    summary: 'Register a new user'
                }
            }
        )
        .post('/token',
            async ({db, status, body}) => {
                const result = await db().select().from(user).where(eq(user.username, body.username)).execute()
                if (!result || result.length === 0) {
                    return status(401, 'Invalid credentials')
                }
                const existingUser = result[0]
                if (!existingUser) {
                    return status(401, 'Invalid credentials')
                }
                const valid = await bcrypt.compare(body.password, existingUser.password)
                if (!valid) {
                    return status(401, 'Invalid credentials')
                }
                const token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60),
                    sub: existingUser.username
                }, 'verysecret');
                return token
            },
            {
                body: 'CredentialsDTO',
                response: {
                    200: t.String(),
                    401: t.String()
                }
                ,
                detail: {
                    tags: ['Auth'],
                    operationId: 'authenticate',
                    summary: 'Create a users token'
                }
            }
        )
        .delete('/:username',
            async ({db, params: {username}, set}) => {
                const result = await db().delete(user).where(eq(user.username, username)).returning()
                if (result && result.length === 1) {
                    set.status = 200
                } else {
                    set.status = 404
                }
            },
            {
                detail: {
                    tags: ['Auth'],
                    operationId: 'deleteUser',
                    summary: 'Deletes a user'
                }
            })
}