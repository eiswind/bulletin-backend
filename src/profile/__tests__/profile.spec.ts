import {afterEach, beforeAll, describe, expect, it} from "vitest";
import type {DrizzleDb} from "../../db/types.js";
import {createApp} from "../../app.js";
import {drizzle} from "drizzle-orm/pglite";
import {migrate} from "drizzle-orm/pglite/migrator";
import {baseDir} from "../../basedir.js";
import {contact, user} from "../../db/schema.js";
import {eq, not} from "drizzle-orm";
import jwt from "jsonwebtoken";

describe("Profile", () => {

    let db: DrizzleDb
    let app: ReturnType<typeof createApp>;
    let token: string;

    beforeAll(async () => {
        db = drizzle()
        await migrate(db, {migrationsFolder: `${baseDir}/../drizzle`})
        app = createApp({db})
        token = jwt.sign({sub: 'user'}, 'verysecret')
    })

    afterEach(async () => {
        await db.delete(user).where(not(eq(user.username, 'user'))).execute()
        await db.delete(contact).execute()
    })


    it('should update the profile', async () => {

        const testProfile = {
            username: 'user',
            firstname: 'John',
            lastname: 'Doe',
            contacts: [
                {email: 'email@test.de', primary: true},
            ]
        }

        const response = await app
            .handle(new Request(`http://localhost/api/profiles/${testProfile.username}`, {
                method: 'PUT',
                headers: [
                    ['Content-Type', 'application/json'],
                    ['Authorization', `Bearer ${token}`]
                ],
                body: JSON.stringify(testProfile)
            }))

        expect(response.status).toEqual(200)


        const userRows = await db.select().from(user).where(eq(user.username, testProfile.username)).execute()
        expect(userRows.length).toEqual(1)
        const userRecord = userRows[0]

        expect(userRecord?.firstname).toEqual(testProfile.firstname)
        expect(userRecord?.lastname).toEqual(testProfile.lastname)

        const contactRows = await db.select().from(contact).where(eq(contact.user, testProfile.username)).execute()
        expect(contactRows.length).toEqual(1)
        const contactRecord = contactRows[0]

        expect(contactRecord?.email).toEqual(testProfile.contacts[0]?.email)
        expect(contactRecord?.primary).toEqual(testProfile.contacts[0]?.primary)
    })

    it('should read a profile', async () => {

        const testContact = {user: 'user', email: 'test@test.de', primary: true}

        await db.insert(contact).values(testContact).execute()
        await db.update(user).set({
            firstname: 'John',
            lastname: 'Doe'
        }).where(eq(user.username, testContact.user)).execute()

        const response = await app
            .handle(new Request(`http://localhost/api/profiles/${testContact.user}`, {
                headers: [
                    ['Authorization', `Bearer ${token}`]
                ]
            }))

        expect(response.status).toEqual(200)

        const json = await response.json()


        expect(json.firstname).toEqual('John')
        expect(json.lastname).toEqual('Doe')

        expect(json.contacts.length).toEqual(1)
        expect(json.contacts[0].email).toEqual(testContact.email)
        expect(json.contacts[0].primary).toEqual(testContact.primary)
        await db.update(user).set({firstname: '', lastname: ''}).where(eq(user.username, testContact.user)).execute()
    })


})