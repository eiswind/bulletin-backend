import {Elysia, t} from "elysia";

export const messageDTO = t.Object({
    text: t.String({readOnly: true}),
    createdAt: t.Optional(t.String({
        required: false,
        format: 'date-time',
        readOnly: true
    })),
    id: t.String({uuid: true, readOnly: true}),
    likes: t.Number({readOnly: true})
})


export const createOrEditMessageDTO = t.Object({
    text: t.String({readOnly: true}),
    likes: t.Number({readOnly: true})
})


export const messageModel = new Elysia()
    .model({
        MessageDTO: messageDTO,
        CreateOrEditMessageDTO: createOrEditMessageDTO
    })