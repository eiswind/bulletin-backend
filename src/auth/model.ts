import {Elysia, t} from "elysia";

export const userDTO = t.Object({
    username: t.String(),
    password: t.String()
})


export const credentialsDTO = t.Object({
    username: t.String(),
    password: t.String()
})





export const authModel = new Elysia()
    .model({
        UserDTO: userDTO,
        CredentialsDTO: credentialsDTO,
    })