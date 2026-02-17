import {Elysia} from "elysia";
import type {DrizzleDb} from "./types.js";

export const dbPlugin = (db : DrizzleDb) =>
    new Elysia({name: 'db'})
        .decorate('db', (): DrizzleDb => db)