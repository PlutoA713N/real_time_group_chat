import UserRegistrationModel from "./user.model";
import { AppError } from "./../errors/AppError";

interface CheckResult {
    message: string,
    isExists: boolean
}

async function checkFieldExists(field: 'username' | 'email', value: string): Promise<CheckResult> {
    try {
        const existingUser = await UserRegistrationModel.findOne({ [field]: value })
        if (existingUser) {
            return { message: `${[field]} already exists`, isExists: true }
        }
        return { message: '', isExists: false }
    } catch (error) {
        throw new AppError(
            `Failed to check ${field}: ${error instanceof Error ? error.message : String(error)}`,
            500,
            'DB_CHECK_ERROR'
        );
    }
}

export { checkFieldExists }
