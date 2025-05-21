import { Request, Response, NextFunction } from "express";
import { createError } from "./../errors/createError";
import { IDecodedToken, verifyJwtToken } from "./../utils/jwt";
import {checkFieldExists, validateAndAttach} from "./../models/dbOperations";
import { UserRegistrationModel } from "./../models/user.model";
import {IAuthenticatedRequest} from "./checkidHandler";
import {getUserToken} from "../redis/redisUtils";

export const authenticationHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(createError('Missing or invalid token', 401, 'INVALID_AUTH_TOKEN'));
        }

        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return next(createError('Missing token', 401, 'INVALID_AUTH_TOKEN'))
        }

        const { userId } = verifyJwtToken(token) as IDecodedToken
        const storedTokenValue = await getUserToken(userId)

        if (!storedTokenValue) {
            return next(createError('Token not found (likely expired)', 401, 'EXPIRED_AUTH_TOKEN'));
        }

        if (storedTokenValue !== token) {
            return next(createError('Token has been revoked or replaced', 401, 'EXPIRED_AUTH_TOKEN'));
        }

        await validateAndAttach(UserRegistrationModel, userId, 'user', req as IAuthenticatedRequest)

        return next()

    } catch (error) {
        return next(error)
    }
}

