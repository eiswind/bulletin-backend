import {Elysia, t} from "elysia";

export const contactDTO = t.Object({
    email: t.String(),
    primary: t.Boolean(),

})

export const profileDTO = t.Object({
    username: t.String(),
    firstname: t.String(),
    lastname: t.String(),
    phoneAllowed: t.Boolean(),
    phoneCountryCode: t.String(),
    phoneNumber: t.String(),
    contacts: t.Array( t.Ref('ContactDTO'))
})



export const profileModel = new Elysia()
    .model({
        ContactDTO: contactDTO,
        ProfileDTO: profileDTO,
    })