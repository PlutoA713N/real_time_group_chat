import {Request, Response, NextFunction} from "express";
import {IMessageHistoryQuery} from "../interfaces/api.interfaces";
import {createSuccessResponse} from "../errors/createSuccessResponse";
import {UserMessageModel} from "../models/user.message.model";

export async function getUserHistory(req: Request<{},{},{},IMessageHistoryQuery>, res: Response, next: NextFunction) {
    try{
        const {userId, withUserId = '', groupId = ''} = req.query as IMessageHistoryQuery

        const page = Number(req.query.page) || 1
        const pageSize = Number(req.query.pageSize) || 25

        const query: any = { senderId: userId }

        if(withUserId) {
            query.receiverId = withUserId
        }else{
            query.groupId = groupId
        }

        const totalMessages = await UserMessageModel.countDocuments(query)

        const totalPages = Math.ceil(totalMessages / pageSize)
        const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1

        const messages = await UserMessageModel.find(query).sort({createdAt: -1}).skip((currentPage - 1) * pageSize).limit(pageSize)

        const clamped = currentPage !== page ? true : undefined

        res.status(200).json(createSuccessResponse('message history retrieved successfully', {
            totalMessages,
            totalPages,
            currentPage,
            requestPage: page,
            clamped,
            pageSize,
            messages: messages
        }))

        return

    }catch(error){
        console.log('Error in user history controller:', error)
        next(error)
    }
}