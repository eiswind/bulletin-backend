import {afterEach, beforeAll, describe, expect, it} from "vitest";
import type {DrizzleDb} from "../../db/types.js";
import {createApp} from "../../app.js";
import {drizzle} from "drizzle-orm/pglite";
import {migrate} from "drizzle-orm/pglite/migrator";
import {baseDir} from "../../basedir.js";
import {user} from "../../db/schema.js";
import {eq, not} from "drizzle-orm";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

describe("Auth", () => {

    let db: DrizzleDb
    let app: ReturnType<typeof createApp>;

    beforeAll(async () => {
        db = drizzle()
        await migrate(db, {migrationsFolder: `${baseDir}/../drizzle`})
        app = createApp({db})
    })

    afterEach(async () =>
        await db.delete(user).where(not(eq(user.username, 'user'))).execute()
    )


    it('should register a new user', async () => {

        const testUser = {username: 'Flash', password:'Gordon'}

        const response = await app
            .handle(new Request('http://localhost/api/auth/register', {
                method: 'POST',
                headers: [['Content-Type', 'application/json']],
                body: JSON.stringify(testUser)
            }))

        expect(response.status).toEqual(201)

        const json = await response.json()

        expect(json.username).toEqual(testUser.username)
        expect(json.password).toBeTruthy()

        const rows = await db.select().from(user).where(eq(user.username, testUser.username)).execute()
        expect(rows.length).toEqual(1)
        const record = rows[0]

        expect(record?.username).toEqual(testUser.username)

        const hash = record?.password
        const match = await bcrypt.compare(testUser.password, hash||'');
        expect(match).toBeTruthy()
    })

    it('should create a token', async () => {

        const testUser = {username: 'user', password:'password'}

        const response = await app
            .handle(new Request('http://localhost/api/auth/token', {
                method: 'POST',
                headers: [['Content-Type', 'application/json']],
                body: JSON.stringify(testUser)
            }))

        expect(response.status).toEqual(200)

        const token = await response.text()
        const decoded = jwt.verify(token, 'verysecret');

        expect(decoded.sub).toEqual(testUser.username)

    })

    it('should deny unknown users', async () => {

        const testUser = {username: 'user1', password:'password'}

        const response = await app
            .handle(new Request('http://localhost/api/auth/token', {
                method: 'POST',
                headers: [['Content-Type', 'application/json']],
                body: JSON.stringify(testUser)
            }))

        expect(response.status).toEqual(401)

    })

    it('should deny wrong password', async () => {

        const testUser = {username: 'user', password:'password1'}

        const response = await app
            .handle(new Request('http://localhost/api/auth/token', {
                method: 'POST',
                headers: [['Content-Type', 'application/json']],
                body: JSON.stringify(testUser)
            }))

        expect(response.status).toEqual(401)

    })

    it('should delete a user', async () => {

        const testUser = {username: 'deleteme', password:'password'}

        await db.insert(user).values(testUser).execute()

        const response = await app
            .handle(new Request(`http://localhost/api/auth/${testUser.username}`, {
                method: 'DELETE'
            }))

        expect(response.status).toEqual(200)

        const result = await db.select().from(user).where(eq(user.username, testUser.username)).execute()
        expect(result.length).toEqual(0)


    })

    it('should not delete a unknown user', async () => {

        const testUser = {username: 'deleteme', password:'password'}

        const response = await app
            .handle(new Request(`http://localhost/api/auth/${testUser.username}`, {
                method: 'DELETE'
            }))

        expect(response.status).toEqual(404)

    })

})