import { UserRegistrationModel } from "./user.model";
import { AppError } from "./../errors/AppError";

interface CheckResult <T> {
    message: string,
    user: T | null,
    isExists: boolean
}

export async function checkFieldExists<T = any>(field: string, value: string): Promise<CheckResult<T>> {
    try {
        const existingUser = await UserRegistrationModel.findOne({ [field]: value }) 
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

