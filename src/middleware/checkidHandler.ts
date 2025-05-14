import { NextFunction, Request, Response } from "express";
import {createError} from "./../errors/createError";
import {checkFieldExists} from "../models/dbOperations";
import {IUserRegistration, IUser} from "../models/user.model";
import {IGroup} from "../models/group.model";

export interface IAutenticatedRequest extends Request {
    user?: IUser;
    receiverUser?: IUserRegistration;
    group?: IGroup;
}

export const checkidHandler = async (req: IAutenticatedRequest, res:Response, next:NextFunction) => {
    const {senderId, receiverId = '', groupId = ''} = req.body
    const user = req.user

    // verify the senderId user
    if(!user) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'))
    }

    if(user._id.toString()!== senderId) {
        return next(createError('Sender ID does not match the authenticated user', 403, 'INVALID_USER'))
    }


    // verify the receiverId
    if(receiverId) {
        const receiverUser = await checkFieldExists('_id', receiverId)

        if(!receiverUser.isExists) {
            return next(createError('Receiver ID does not exist', 404, 'USER_NOT_FOUND'))
        }

        req.receiverUser = receiverUser.user
    }

    // verify the group
    if(groupId){
        const group = await checkFieldExists('_id', groupId)

        if(!group.isExists) {
            return next(createError('Group ID does not exist', 404, 'GROUP_NOT_FOUND'))
        }

        req.group = group.user
    }

    return next()
}