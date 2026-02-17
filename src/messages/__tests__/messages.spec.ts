import {afterEach, beforeAll, describe, expect, it} from 'vitest'
import {migrate} from "drizzle-orm/pglite/migrator";
import {drizzle} from "drizzle-orm/pglite";

import {message} from "../../db/schema.js";
import type {DrizzleDb} from "../../db/types.js";
import {createApp} from "../../app.js";
import {baseDir} from "../../basedir.js";


describe("Messages", () => {

    let db: DrizzleDb
    let app: ReturnType<typeof createApp>;

    beforeAll(async () => {
        db = drizzle()
        await migrate(db, {migrationsFolder: `${baseDir}/../drizzle`})
        app = createApp({db})
    })

    afterEach(async () =>
        await db.delete(message).execute()
    )

    it('should return messages', async () => {

        const testMessage = {text: 'hello world', likes: 0}

        await db.insert(message).values(testMessage).execute()

        const response = await app
            .handle(new Request('http://localhost/api/messages'))

        expect(response.status).toEqual(200)

        const json = await response.json()

        expect(json.length).toEqual(1)
        expect(json[0].text).toEqual(testMessage.text)
        expect(json[0].likes).toEqual(testMessage.likes)
        expect(json[0].id).toBeTruthy()
        expect(json[0].createdAt).toBeTruthy()

    })

})