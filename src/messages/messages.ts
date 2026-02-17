import {Elysia,  t } from "elysia"
import {dbPlugin} from "../db/plugin.js";
import {message} from "../db/schema.js";
import type {DrizzleDb} from "../db/types.js";
import {messageModel} from "./model.js";


export const createMessagesPlugin = (options: { db: DrizzleDb }) => {

    return new Elysia({name: 'messages', prefix: '/messages'})
        .use(dbPlugin(options.db))
        .use(messageModel)
        .get('',
            async ({db, status}) => {
                const rows = await db().select().from(message)
                const isoDateRows = rows.map(r =>  ({ ...r, createdAt: r.createdAt?.toISOString() }))
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

}