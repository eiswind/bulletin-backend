import {beforeAll, describe, expect, it} from "vitest";
import type {DrizzleDb} from "../db/types.js";
import {createApp} from "../app.js";
import {drizzle} from "drizzle-orm/pglite";
import {migrate} from "drizzle-orm/pglite/migrator";
import {baseDir} from "../basedir.js";
import fs from 'fs/promises';

describe("OpenAPI", () => {

    let db: DrizzleDb
    let app: ReturnType<typeof createApp>;

    beforeAll(async () => {
        db = drizzle()
        await migrate(db, {migrationsFolder: `${baseDir}/../drizzle`})
        app = createApp({db})
    })

    it('should have an openapi spec', async () => {

        const response = await app
            .handle(new Request('http://localhost/openapi/json'))

        expect(response.status).toEqual(200)

        const content = await response.text()

        const filePath = `${baseDir}/../__openapi__`
        await fs.mkdir(filePath, {recursive: true})
        await fs.writeFile(`${filePath}/openapi.json`, content, 'utf-8');

    })

})