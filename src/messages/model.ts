import {Elysia, t} from "elysia";

const messageDTO = t.Object({
    text: t.String({readOnly: true}),
    createdAt: t.Optional(t.String({
        format: 'date-time',
        readOnly: true
    })),
    id: t.String({uuid: true, readOnly: true}),
    likes: t.Number({readOnly: true})
})


const createOrEditMessageDTO = t.Object({
    text: t.String(),
    likes: t.Number()
})


export const messageModel = new Elysia()
    .model({
        MessageDTO: messageDTO,
        CreateOrEditMessageDTO: createOrEditMessageDTO
    })