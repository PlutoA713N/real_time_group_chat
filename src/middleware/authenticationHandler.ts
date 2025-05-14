import { Request, Response, NextFunction } from "express";
import { createError } from "./../errors/createError";
import { IDecodedToken, verifyJwtToken } from "./../utils/jwt";
import { checkFieldExists } from "./../models/dbOperations";
import { IUserRegistration } from "./../models/user.model";

export const authenticationHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return next(createError('Missing token', 400, 'INVALID_TOKEN'))
        }

        const { userId } = verifyJwtToken(token) as IDecodedToken

        // Get the sender ID user
        const { user, isExists } = await checkFieldExists('_id', userId)

        if (!isExists) {
            return next(createError('User not found', 404, 'INVALID_USER'))
        }

        (req as Request & {
            user?: IUserRegistration
        }).user = user

        next()

    } catch (error) {
        next(error)
    }
}

