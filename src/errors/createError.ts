import { CustomError } from "../middleware/errorHandler";
import { AppError } from "./AppError";

export function createError(message: string, statusCode: number = 500, code: string = "INTERNAL_SERVER_ERROR", errors?: any[]): CustomError {
    return new AppError(message, statusCode, code, errors)
}