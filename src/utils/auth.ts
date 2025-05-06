import { compare, hash } from "bcrypt"
import { AppError } from "./../errors/AppError";

const generateHash = async (password: string): Promise<string> => {
    try {
        const userPasswordHash = await hash(password, 10)
        return userPasswordHash
    } catch (err) {
        throw new AppError(`Password hashing failed: ${(err instanceof Error ? err.message : String(err))}`, 409, 'HASH_ERROR');
    }
}

const comparePassword = async (password: string, userPasswordHash: string): Promise<boolean> => {
    try {
        const result = await compare(password, userPasswordHash)
        return result
    } catch (err: any) {
        throw new AppError(
            `Password comparison failed: ${err instanceof Error ? err.message : 'An unexpected error occurred during password comparison'}`,
             500,
            'PASSWORD_COMPARISON_ERROR'
        );
    }
}

export { comparePassword, generateHash }