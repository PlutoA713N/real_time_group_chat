import { NextFunction, Request, Response } from "express";
import {createError} from "./../errors/createError";
import {validateAndAttach} from "../models/dbOperations";
import {IUserRegistration, IUser, UserRegistrationModel} from "../models/user.model";
import {IGroup, GroupModel} from "../models/group.model";

export interface IAuthenticatedRequest extends Request {
    user?: IUser;
    receiverUser?: IUserRegistration;
    group?: IGroup;
    [key: string]: any;
}

export const validateIds = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction,
    source: ('body' | 'query' | 'params')[]
) => {

    const user = req.user;

    if (!user) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
    }

    try{
        for(const type of source) {
            const data = req[type] || {};
            const {
                senderId,
                userId,
                receiverId,
                withUserId,
                groupId
            } = data;

            const authId = senderId || userId;

            if (authId && user._id.toString() !== authId) {
                return next(createError(
                    senderId ? 'Sender ID does not match the authenticated user' : 'User ID does not match the authenticated user',
                    403,
                    'INVALID_USER'
                ));
            }

            if (receiverId) {
                await validateAndAttach(UserRegistrationModel, receiverId, 'receiverUser', req);
            }
            if (withUserId) {
                await validateAndAttach(UserRegistrationModel, withUserId, 'receiverUser', req);
            }
            if (groupId) {
                await validateAndAttach(GroupModel, groupId, 'group', req);
            }
        }
        return next();
    } catch (err) {
        return next(err);
    }
};


export const checkMessageIdsFromBody = (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    return validateIds(req, res, next, ['body']);
};

export const checkHistoryIdsFromQuery = (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    return validateIds(req, res, next, ['query']);
};

export const validateGroupMessagesRequest = (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
     return validateIds(req, res, next, ['params', 'body']);
}
