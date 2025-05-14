import { checkFieldExists } from "../models/dbOperations";

export const findUserByField = async (form: object) => {
    for (const [field, value] of Object.entries(form)) {
        if (value) {
            const result = await checkFieldExists(field, value)
            if (result.isExists && result.user) {
                return result.user
            }
        }
    }

    return null
}
