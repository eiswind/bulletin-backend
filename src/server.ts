import {migrate} from "drizzle-orm/pglite/migrator";
import {drizzle} from "drizzle-orm/pglite";
import {createApp} from "./app.js";
import {baseDir} from "./basedir.js";


export const database = drizzle(`${baseDir}/../__data__`);

await migrate(database, {migrationsFolder: `${baseDir}/../drizzle`})



const app = createApp({db: database})

app.listen(3000, ({hostname, port}) => {
    console.log(
        `🦊 Elysia is running at ${hostname}:${port}`
    )
})