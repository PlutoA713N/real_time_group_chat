import { model, Schema } from "mongoose";

export interface IUserMessage {
    senderId: string;
    receiverId?: string;
    groupId?: string;
    content: string;
}

export interface IUserMessageResponse {
    content: string;
}

export interface IUserMessageDocument extends IUserMessage, Document {}

export const UserMessageSchema = new Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String },
    groupId: { type: String },
    content: { type: String }
}, {timestamps: true})


export const UserMessageModel= model<IUserMessage>('UserMessage', UserMessageSchema)