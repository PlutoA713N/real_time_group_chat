import { Request, Response, NextFunction } from "express";
import { createError } from "./../errors/createError"; 
import { findUserByField } from "../utils/validation.utils";
import { comparePassword } from "./../utils/auth";
import { error } from "console";
import { jwtSign } from "../utils/jwt";
import { createSuccessResponse } from "../errors/createSuccessResponse";

export async function handleUserLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, username, password } = req.body;

        const formData = {
            username, email
        }

        const user = await findUserByField(formData)

        if (!user) {
            return next(createError('Invalid Credentials', 401, 'INVALID_CREDENTIALS'))
        }

        const isPasswordMatch = await comparePassword(password, user?.password)

        if (!isPasswordMatch) {
            return next(createError('Password is incorrect', 401, 'INVALID_PASSWORD'))
        }

        if(username && email){
            if(username !== user.username || email !== user.email){
                return next(createError('Invalid Credentials', 401, 'INVALID_CREDENTIALS'))
            }
        }


        const payload = { 
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
         }
        
        const token = jwtSign(payload, '30d')

         res.status(200).json(createSuccessResponse('User logged in successfully', {
            token: token,
            userId: user._id.toString()
         }))
        
         return

    } catch (err) {
        error('Error caught in User login:', err)
        next(err)
    }
}