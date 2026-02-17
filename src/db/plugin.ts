import Elysia from "elysia";
import type {DrizzleDb} from "./types";

export const dbPlugin = (db : DrizzleDb) =>
    new Elysia({name: 'db'})
        .decorate('db', (): DrizzleDb => db)