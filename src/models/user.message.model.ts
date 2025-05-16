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

UserMessageSchema.index({senderId: 1, receiverId:1, createdAt: -1})

UserMessageSchema.index({groupId:1, createdAt: -1})

export const UserMessageModel= model<IUserMessage>('UserMessage', UserMessageSchema)