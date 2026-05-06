import {Elysia, t} from "elysia";

const userDTO = t.Object({
    username: t.String(),
    password: t.String()
})


const credentialsDTO = t.Object({
    username: t.String(),
    password: t.String()
})





export const authModel = new Elysia()
    .model({
        UserDTO: userDTO,
        CredentialsDTO: credentialsDTO,
    })