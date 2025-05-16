import {Model} from "mongoose";
import { AppError } from "./../errors/AppError";
import {NextFunction, Request} from "express";
import {createError} from "../errors/createError";
import {IAutenticatedRequest} from "../middleware/checkidHandler";

interface CheckResult <T> {
    message: string,
    user: T | null,
    isExists: boolean
}

export async function checkFieldExists<T = any>(model: Model<any>, field: string, value: string): Promise<CheckResult<T>> {
    try {
        const existingUser = await model.findOne({ [field]: value })
        if (existingUser) {
            return { message: `${[field]} exists`, user: existingUser as T, isExists: true }
        }
        return { message: '', user: null, isExists: false }
    } catch (error) {
        throw new AppError(
            `Failed to check ${field}: ${error instanceof Error ? error.message : String(error)}`,
            500,
            'DB_CHECK_ERROR'
        );
    }
}

export async function validateAndAttach(model: Model<any>,fieldId: string, field: string, req: IAutenticatedRequest) {
    const result = await checkFieldExists(model,'_id', fieldId);
    if (!result.isExists) {
        throw createError(`${field} does not exist`, 404, `${field.toUpperCase()}_NOT_FOUND`);
    }

    req[field] = result.user;
    return req
}

