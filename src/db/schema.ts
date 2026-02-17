import {bigint, pgTable, text, timestamp, uuid} from "drizzle-orm/pg-core";

export const message = pgTable(
    'message',
    {
        id: uuid('id').notNull().defaultRandom().primaryKey(),
        text: text('text').notNull(),
        createdAt: timestamp('created_at', {mode: "date"}).notNull().defaultNow(),
        likes: bigint({mode: 'number'}).notNull().default(0),

    }
)