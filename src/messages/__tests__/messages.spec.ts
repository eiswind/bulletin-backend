import {afterEach, beforeAll, describe, expect, it} from 'vitest'
import {migrate} from "drizzle-orm/pglite/migrator";
import {drizzle} from "drizzle-orm/pglite";

import {message} from "../../db/schema.js";
import type {DrizzleDb} from "../../db/types.js";
import {createApp} from "../../app.js";
import {baseDir} from "../../basedir.js";
import jwt from "jsonwebtoken";

describe("Messages", () => {

    let db: DrizzleDb
    let app: ReturnType<typeof createApp>;
    let token: string;

    beforeAll(async () => {
        db = drizzle()
        await migrate(db, {migrationsFolder: `${baseDir}/../drizzle`})
        app = createApp({db})

        token = jwt.sign({sub: 'user'}, 'verysecret')
    })

    afterEach(async () =>
        await db.delete(message).execute()
    )

    it('should return messages', async () => {

        const testMessage = {text: 'hello world', likes: 0}

        await db.insert(message).values(testMessage).execute()

        const response = await app
            .handle(new Request('http://localhost/api/messages', {
                headers: [['Authorization', `Bearer ${token}`]]
            }))

        expect(response.status).toEqual(200)

        const json = await response.json()

        expect(json.length).toEqual(1)
        expect(json[0].text).toEqual(testMessage.text)
        expect(json[0].likes).toEqual(testMessage.likes)
        expect(json[0].id).toBeTruthy()
        expect(json[0].createdAt).toBeTruthy()

    })

    it('should fail on wrong token', async () => {

        const wrongtoken = jwt.sign({sub: 'user'}, 'wrong')
        const response = await app
            .handle(new Request('http://localhost/api/messages', {
                headers: [['Authorization', `Bearer ${wrongtoken}`]]
            }))

        expect(response.status).toEqual(401)
    })

    it('should save a message', async () => {

        const testMessage = {text: 'hello world', likes: 0}

        const response = await app
            .handle(new Request('http://localhost/api/messages', {
                method: 'POST',
                headers: [
                    ['Content-Type', 'application/json'],
                    ['Authorization', `Bearer ${token}`]
                ],
                body: JSON.stringify(testMessage)
            }))

        expect(response.status).toEqual(201)

        const json = await response.json()

        expect(json.text).toEqual(testMessage.text)
        expect(json.likes).toEqual(testMessage.likes)
        expect(json.id).toBeTruthy()
        expect(json.createdAt).toBeTruthy()

        const rows = await db.select().from(message).execute()
        expect(rows.length).toEqual(1)
        const record = rows[0]

        expect(record?.text).toEqual(testMessage.text)
        expect(record?.likes).toEqual(testMessage.likes)
        expect(record?.id).toBeTruthy()
        expect(record?.createdAt).toBeTruthy()
    })


    it('should update a message', async () => {

        const testMessage = {text: 'hello world', likes: 0}
        const updatedMessage = {text: 'hello hello', likes: 1}

        let rows = await db.insert(message).values(testMessage).returning()
        expect(rows.length).toEqual(1)
        const record = rows[0]


        const response = await app
            .handle(new Request(`http://localhost/api/messages/${record?.id}`, {
                method: 'PUT',
                headers: [
                    ['Content-Type', 'application/json'],
                    ['Authorization', `Bearer ${token}`]
                ],
                body: JSON.stringify(updatedMessage)
            }))

        expect(response.status).toEqual(200)

        const json = await response.json()

        expect(json.text).toEqual(updatedMessage.text)
        expect(json.likes).toEqual(updatedMessage.likes)
        expect(json.id).toEqual(record?.id)
        expect(json.createdAt).toEqual(record?.createdAt?.toISOString())

        rows = await db.select().from(message).execute()
        expect(rows.length).toEqual(1)
        const newRecord = rows[0]

        expect(newRecord?.text).toEqual(updatedMessage.text)
        expect(newRecord?.likes).toEqual(updatedMessage.likes)
        expect(newRecord?.id).toEqual(record?.id)
        expect(newRecord?.createdAt).toEqual(record?.createdAt)
    })

    it('should delete a message', async () => {

        const testMessage = {text: 'hello world', likes: 0}

        let rows = await db.insert(message).values(testMessage).returning()
        expect(rows.length).toEqual(1)
        const record = rows[0]

        const response = await app
            .handle(new Request(`http://localhost/api/messages/${record?.id}`, {
                method: 'DELETE',
                headers: [
                    ['Authorization', `Bearer ${token}`]
                ],
            }))

        expect(response.status).toEqual(200)

        rows = await db.select().from(message).execute()
        expect(rows.length).toEqual(0)
    })

})