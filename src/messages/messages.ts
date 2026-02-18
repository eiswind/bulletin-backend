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
                    tags: ['Message'],
                    operationId: 'findAllMessages',
                    summary: 'Get all messages'
                }
            }
        )
        .post('', async ({db, body, status}) => {
            const result = await db().insert(message).values(body).returning()
            if (result && result.length === 1) {
                const record = result[0]
                if (record) {
                    return status(201, {...record, createdAt: record.createdAt?.toISOString()})
                }
            }

            return status(500, 'Something went wrong')

        }, {
            body: t.Ref('CreateOrEditMessageDTO'),
            response: {
                201: t.Ref('MessageDTO'),
                500: t.String()
            },
            detail: {
                tags: ['Message'],
                operationId: 'saveMessage',
                summary: 'Create a new message'
            }
        })
        .put('/:messageId', async ({db, body, status,  params: {messageId}}) => {
            const result = await db().update(message).set(body).where(eq(message.id, messageId)).returning()
            if (result && result.length === 1) {
                const record = result[0]
                if (record) {
                    return {...record, createdAt: record.createdAt?.toISOString()}
                }
            }

            return status(404, 'Message not found')

        }, {
            body: t.Ref('CreateOrEditMessageDTO'),
            response: {
                200: t.Ref('MessageDTO'),
                404: t.String()
            },
            detail: {
                tags: ['Message'],
                operationId: 'updateMessage',
                summary: 'Update a message'
            }
        })
        .delete('/:messageId', async ({db, status, params: {messageId}}) => {
            const result = await db().delete(message).where(eq(message.id, messageId)).returning()
            if (result && result.length === 1) {
                return status(200, 'Message deleted')
            } else {
                return status(404, 'Message not found')
            }
        }, {
            response: {
                200: t.String(),
                404: t.String()
            },
            detail: {
                tags: ['Message'],
                operationId: 'deleteMessageById',
                summary: 'Delete a message'
            }
        })

}