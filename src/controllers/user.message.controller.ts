import { Request, Response, NextFunction } from "express";
import { UserMessageModel } from "./../models/user.message.model";
import { createSuccessResponse } from "../errors/createSuccessResponse";
import {GroupModel, IGroup} from "../models/group.model";
import { createError } from "./../errors/createError";
import {emitToGroup, emitToUser} from "./../sockets/utils/io.message.utils";
import {IAuthenticatedRequest} from "../middleware/checkidHandler";


export const userMessageController = async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {

        const { senderId, receiverId = '', groupId = '', content } = req.body
        let group: IGroup | null = null;

        if(senderId === receiverId) {
            return next(createError('You cannot send a message to yourself', 400, 'INVALID_MESSAGE'))
        }

        if (groupId) {
            if (!req.group) {
                return next(createError('Group not found', 404, 'GROUP_NOT_FOUND'))
            }

            group = req.group as IGroup
            if (!group.name) return next(createError('Group not found', 404, 'GROUP_NOT_FOUND'))

            if (!group.members.includes(senderId)) {
                return next(createError('You are not a member of this group', 403, 'NOT_A_MEMBER'))
            }
        }

        const newMessage = new UserMessageModel({
            senderId, receiverId, groupId, content
        })

        const savedMessage = await newMessage.save()

        if (receiverId) {
            emitToUser(receiverId, 'message', savedMessage)
        }

        if(groupId) {
            emitToGroup(groupId, savedMessage)
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