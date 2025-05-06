import  { model, Schema } from "mongoose"

interface IUserRegistration {
    username: string,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date,
}

const userRegistrationSchema = new Schema<IUserRegistration>({
    username: {type: String, required: true, unique: true, trim: true, minlength:3, maxlength:20},
    email: {type: String, required: true, unique: true, trim: true,  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/},
    password: {type: String, required: true, minlength: 8, match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/ },
}, {timestamps: true})

const UserRegistrationModel = model<IUserRegistration>('UserRegistration', userRegistrationSchema)

export default UserRegistrationModel