import {Elysia, t} from "elysia"
import {dbPlugin} from "../db/plugin.js";
import {message} from "../db/schema.js";
import type {DrizzleDb} from "../db/types.js";
import {messageModel} from "./model.js";
import {eq} from "drizzle-orm";


export const createMessagesPlugin = (options: { db: DrizzleDb }) => {

    return new Elysia({name: 'messages', prefix: '/messages'})
        .use(dbPlugin(options.db))
        .use(messageModel)
        .get('',
            async ({db, status}) => {
                const rows = await db().select().from(message)
                const isoDateRows = rows.map(r => ({...r, createdAt: r.createdAt?.toISOString()}))
                return status(200, isoDateRows)
            },
            {
                response: t.Array(t.Ref('MessageDTO')),
                detail: {
                    tags: ['messages'],
                    operationId: 'findAllMessages',
                    summary: 'Get all messages'
                }
            }
        )
        .post('', async ({db, body, set, status}) => {
            const result = await db().insert(message).values(body).returning()
            if (result && result.length === 1) {
                const record = result[0]
                if (record) {
                    return status(201, {...record, createdAt: record.createdAt?.toISOString()})
                }
            }
            set.status = 500
            return

        }, {
            body: t.Ref('CreateOrEditMessageDTO'),
            response: {
                201: t.Ref('MessageDTO'),
                500: t.Void()
            },
            detail: {
                tags: ['messages'],
                operationId: 'saveMessage',
                summary: 'Create a new message'
            }
        })
        .put('/:id', async ({db, body, set, params: {id}}) => {
            const result = await db().update(message).set(body).where(eq(message.id, id)).returning()
            if (result && result.length === 1) {
                const record = result[0]
                if (record) {
                    return {...record, createdAt: record.createdAt?.toISOString()}
                }
            }
            set.status = 404
            return

        }, {
            body: t.Ref('CreateOrEditMessageDTO'),
            response: {
                200: t.Ref('MessageDTO'),
                404: t.Void()
            },
            detail: {
                tags: ['messages'],
                operationId: 'updateMessage',
                summary: 'Update a message'
            }
        })
        .delete('/:id', async ({db, set, params: {id}}) => {
            const result = await db().delete(message).where(eq(message.id, id)).returning()
            if (result && result.length === 1) {
                set.status = 200
            } else {
                set.status = 404
            }
            return
        }, {
            detail: {
                tags: ['messages'],
                operationId: 'deleteMessageById',
                summary: 'Delete a message'
            }
        })

}