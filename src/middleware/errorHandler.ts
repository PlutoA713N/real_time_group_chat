import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { error } from "console";

export interface CustomError extends Error {
    statusCode?: number,
    code?: string
    errors?: any[];
}

export async function errorHandler(err: CustomError , req: Request, res: Response, next: NextFunction) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map((e: any) => ({
            field: e.path,
            message: e.message,
            kind: e.kind,
            value: e.value
        }))

           res.status(400).json({
            success: false,
               message: 'Validation failed',
               errors : errors
            })

            return

    }

    error('Global Error:', {
        statusCode,
        message: message,
        code: err.code || 'N/A',
        stack: err.stack
    })

    res.status(statusCode).json({
        success: false,
        message,
        code: err.code || 'INTERNAL_SERVER_ERROR',
        error: err.errors || undefined,
    })
}