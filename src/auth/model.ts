import {Elysia, t} from "elysia";

export const userDTO = t.Object({
    username: t.String(),
    password: t.String()
})


export const credentialsDTO = t.Object({
    username: t.String(),
    password: t.String()
})

export const contactDTO = t.Object({
    email: t.String(),
    primary: t.Boolean()
})

export const profileDTO = t.Object({
    username: t.String(),
    firstname: t.String(),
    lastname: t.String(),
    contacts: t.Array( t.Ref('ContactDTO'))
})



export const authModel = new Elysia()
    .model({
        UserDTO: userDTO,
        CredentialsDTO: credentialsDTO,
        ContactDTO: contactDTO,
        ProfileDTO: profileDTO,
    })