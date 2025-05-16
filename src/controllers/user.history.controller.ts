import {Request, Response, NextFunction} from "express";
import {IMessageHistoryQuery} from "../interfaces/api.interfaces";
import {createSuccessResponse} from "../errors/createSuccessResponse";
import {UserMessageModel} from "../models/user.message.model";

export async function getUserHistory(req: Request<{},{},{},IMessageHistoryQuery>, res: Response, next: NextFunction) {
    try{
        const {userId, withUserId = '', groupId = '', page = 1, pageSize = 25} = req.query as IMessageHistoryQuery
        const query: any = { senderId: userId }

        if(withUserId) {
            query.receiverId = withUserId
        }
        // we will do group messages later

        const messages = await UserMessageModel.find(query).sort({createdAt: -1}).skip((page - 1) * pageSize).limit(pageSize)

        const totalMessages = await UserMessageModel.countDocuments(query)

        const totalPages = Math.ceil(totalMessages / pageSize)
        const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1

        res.status(200).json(createSuccessResponse('message history retrieved successfully', {
            totalMessages,
            totalPages,
            currentPage,
            pageSize,
            messages: messages
        }))

    }catch(error){
        console.log('Error in user history controller:', error)
        next(error)
    }
}