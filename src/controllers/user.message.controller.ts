import { Request, Response, NextFunction } from "express";
import { UserMessageModel } from "./../models/user.message.model";
import { createSuccessResponse } from "../errors/createSuccessResponse";
import { GroupModel } from "../models/group.model";
import { createError } from "./../errors/createError";
import {emitToUser} from "./../sockets/utils/io.message.utils";


export const userMessageController = async (req: Request, res: Response, next: NextFunction) => {
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
                const group = await GroupModel.findById({ _id: groupId })
                if (!group) return next(createError('Group not found', 404, 'GROUP_NOT_FOUND'))

                group.members.forEach((memberId) => {
                   emitToUser(memberId, 'group_message', savedMessage)
                })
        }

        res.status(200).json(createSuccessResponse('message sent successfully', {
            message: savedMessage
        }))

        return


    } catch (error) {
        console.log('Error in user message controller:', error)
        next(error)
    }
}