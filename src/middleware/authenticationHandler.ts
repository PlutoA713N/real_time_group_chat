import { Request, Response, NextFunction } from "express";
import { createError } from "./../errors/createError";
import { IDecodedToken, verifyJwtToken } from "./../utils/jwt";
import {checkFieldExists, validateAndAttach} from "./../models/dbOperations";
import { UserRegistrationModel } from "./../models/user.model";
import {IAuthenticatedRequest} from "./checkidHandler";

export const authenticationHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return next(createError('Missing token', 401, 'INVALID_AUTH_TOKEN'))
        }

        const { userId } = verifyJwtToken(token) as IDecodedToken

        await validateAndAttach(UserRegistrationModel, userId, 'user', req as IAuthenticatedRequest)

        return next()

    } catch (error) {
        return next(error)
    }
}

