import { Request, Response, NextFunction } from "express";
import { UserMessageModel } from "./../models/user.message.model";
import { createSuccessResponse } from "../errors/createSuccessResponse";
import { GroupModel } from "../models/group.model";
import { AppError } from "../errors/AppError";
import {emitToUser} from "./../sockets/utils/io.message.utils";


export const userMessageController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { senderId, receiverId = '', groupId = '', content } = req.body

        const newMessage = new UserMessageModel({
            senderId, receiverId, groupId, content
        })

        const savedMessage = await newMessage.save()

        if (receiverId) {
            emitToUser(receiverId, 'receive_message', savedMessage)
        }


        if (groupId) {
                const group = await GroupModel.findById({ _id: groupId })
                if (!group) throw new AppError('Group not found', 404, 'DOCUMENT_IS_MISSING')

                group.members.forEach((memberId) => {
                   emitToUser(memberId, 'receive_message', savedMessage)
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