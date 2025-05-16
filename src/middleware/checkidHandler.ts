import { NextFunction, Request, Response } from "express";
import {createError} from "./../errors/createError";
import {validateAndAttach} from "../models/dbOperations";
import {IUserRegistration, IUser, UserRegistrationModel} from "../models/user.model";
import {IGroup, GroupModel} from "../models/group.model";

export interface IAutenticatedRequest extends Request {
    user?: IUser;
    receiverUser?: IUserRegistration;
    group?: IGroup;
    [key: string]: any;
}

export const checkidHandler = async (req: IAutenticatedRequest, res:Response, next:NextFunction) => {
    const {senderId, receiverId = '', withUserId = '', groupId = ''} = req.body
    const user = req.user

    // verify the senderId user
    if(!user) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'))
    }

    if(user._id.toString()!== senderId) {
        return next(createError('Sender ID does not match the authenticated user', 403, 'INVALID_USER'))
    }

    try{
        if(receiverId) {
            await  validateAndAttach(UserRegistrationModel, receiverId, 'receiverUser', req)
        }
        if(withUserId) {
            await  validateAndAttach(UserRegistrationModel, withUserId, 'receiverUser', req)
        }
        if(groupId) {
            await  validateAndAttach(GroupModel, groupId, 'group', req)
        }

        return next()
    }catch(error){
        return next(error)
    }

}