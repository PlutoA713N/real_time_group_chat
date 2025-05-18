import { Request, Response, NextFunction } from "express";
import { UserMessageModel } from "./../models/user.message.model";
import { createSuccessResponse } from "../errors/createSuccessResponse";
import {GroupModel, IGroup} from "../models/group.model";
import { createError } from "./../errors/createError";
import {emitToUser} from "./../sockets/utils/io.message.utils";
import {IAuthenticatedRequest} from "../middleware/checkidHandler";


export const userMessageController = async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {

        const { senderId, receiverId = '', groupId = '', content } = req.body

        const newMessage = new UserMessageModel({
            senderId, receiverId, groupId, content
        })

        const savedMessage = await newMessage.save()

        if (receiverId) {
            emitToUser(receiverId, 'message', savedMessage)
        }


        if (groupId) {
                const {name, members} = req.group as IGroup
                if (!name) return next(createError('Group not found', 404, 'GROUP_NOT_FOUND'))

                members.forEach((memberId) => {
                   emitToUser(memberId, 'group_message', savedMessage)
                })
        }

        res.status(201).json(createSuccessResponse('message sent successfully', {
            success: true,
            message: savedMessage
        }))

    } catch (error) {
        console.log('Error in user message controller:', error)
        next(error)
    }
}