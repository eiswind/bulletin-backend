import type {DrizzleDb} from "../db/types.js";
import {Elysia, t} from "elysia";
import {dbPlugin} from "../db/plugin.js";
import {contact, user} from "../db/schema.js";
import {eq} from "drizzle-orm";

import {profileModel} from "./model.js";


export const createProfilePlugin = (options: { db: DrizzleDb }) => {

    return new Elysia({name: 'profile', prefix: '/profiles'})
        .use(dbPlugin(options.db))
        .use(profileModel)
        .get('/:username',
            async ({db, set, status, params: {username}}) => {
                const profileResult = await db().select({
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname
                }).from(user).where(eq(user.username, username)).execute()
                if (!profileResult || profileResult.length === 0) {
                    return status(404, 'User not found')
                }
                const profileUser = profileResult[0]
                if (!profileUser) {

                    return status(404, 'User not found')
                }
                const contactsResult = await db().select({
                    email: contact.email,
                    primary: contact.primary
                }).from(contact).where(eq(contact.user, username)).execute()
                return {...profileUser, contacts: contactsResult}
            },
            {
                response: {
                    200: 'ProfileDTO',
                    404: t.String(),
                }
                ,
                detail: {
                    tags: ['Profile'],
                    operationId: 'findProfileById',
                    summary: 'Gets a users profile'
                }
            }
        )
        .put('/:username',
            async ({db, status, body, params: {username}},) => {

                return await db().transaction(async (tx) => {
                    const profileResult = await tx.update(user).set({
                        firstname: body.firstname,
                        lastname: body.lastname
                    }).where(eq(user.username, username)).returning()
                    const profileUser = profileResult[0]
                    if (!profileUser) {
                        return status(404, 'User not found')
                    }
                    await tx.delete(contact).where(eq(contact.user, username)).execute()
                    for (const c of body.contacts) {
                        await tx.insert(contact).values({user: username, ...c}).execute()
                    }
                    return body
                })
            },
            {
                body: 'ProfileDTO',
                response: {
                    200: 'ProfileDTO',
                    404: t.String(),
                }
                ,
                detail: {
                    tags: ['Profile'],
                    operationId: 'updateProfile',
                    summary: 'Gets a users profile'
                }
            })
}