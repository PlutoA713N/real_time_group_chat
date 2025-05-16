import { checkFieldExists } from "../models/dbOperations";
import { UserRegistrationModel } from "../models/user.model";

export const findUserByField = async (form: object) => {
    for (const [field, value] of Object.entries(form)) {
        if (value) {
            const result = await checkFieldExists(UserRegistrationModel, field, value)
            if (result.isExists && result.user) {
                return result.user
            }
        }
    }

    return null
}
