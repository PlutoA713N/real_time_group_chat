import { Request, Response, NextFunction } from "express";
import { createError } from "./../errors/createError";
import { IDecodedToken, verifyJwtToken } from "./../utils/jwt";
import {checkFieldExists, validateAndAttach} from "./../models/dbOperations";
import { UserRegistrationModel } from "./../models/user.model";
import {IAutenticatedRequest} from "./checkidHandler";

export const authenticationHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return next(createError('Missing token', 400, 'INVALID_TOKEN'))
        }

        const { userId } = verifyJwtToken(token) as IDecodedToken

        await validateAndAttach(UserRegistrationModel, userId, 'user', req as IAutenticatedRequest)

        return next()

    } catch (error) {
        return next(error)
    }
}

