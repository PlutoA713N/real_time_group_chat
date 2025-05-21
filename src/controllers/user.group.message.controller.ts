import {Request, Response, NextFunction} from "express";
import {UserMessageModel} from "../models/user.message.model";
import {createSuccessResponse} from "../errors/createSuccessResponse";
import {IAuthenticatedRequest} from "../middleware/checkidHandler";
import {IGroup} from "../models/group.model";
import {emitToGroup} from "../sockets/utils/io.message.utils";

export async function createGroupMessage(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try{
        const { senderId, content } = req.body
        const {groupId} = req.params

        const {name} = req.group as IGroup
        const newGroupMessage = new UserMessageModel({
            senderId, content, groupId
        })

        const savedMessage = await newGroupMessage.save()

        emitToGroup(groupId, savedMessage)

        res.status(201).json(createSuccessResponse('message sent successfully', {
            success: true,
            groupName: name,
            message: savedMessage
        }))

    }catch (e) {
        console.error('Error in create group message function', e)
        next(e)
    }
}