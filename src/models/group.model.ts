import { model, Schema } from "mongoose";

export interface IGroup {
    name: string;
    members: [string];
}

const GroupSchema = new Schema({
    name: { type: String, required: true },
    members: [{ type: String, required: true }]
}, { timestamps: true })


export const GroupModel = model<IGroup>('Group', GroupSchema) 