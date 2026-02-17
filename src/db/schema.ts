import {bigint, boolean, pgTable, text, timestamp, uuid} from "drizzle-orm/pg-core";

export const message = pgTable(
    'message',
    {
        id: uuid('id').notNull().defaultRandom().primaryKey(),
        text: text('text').notNull(),
        createdAt: timestamp('created_at', {mode: "date"}).notNull().defaultNow(),
        likes: bigint({mode: 'number'}).notNull().default(0),

    }
)

export const user = pgTable(
    'user',
    {
        username: text('username').notNull().unique(),
        password: text('').notNull(),
        firstname: text('firstname').notNull(),
        lastname: text('lastname').notNull(),
    }
)

export const contact = pgTable(
    'contact',
    {
        id: uuid('id').notNull().defaultRandom().primaryKey(),
        email: text('email').notNull(),
        user: text('user').notNull().references(() => user.username, {onDelete: 'cascade'}),
        primary: boolean('primary').notNull().default(false)
    },
)