import { Response, NextFunction} from "express";
import {GroupModel} from "../models/group.model";
import {checkFieldExists} from "../models/dbOperations";
import {createError} from "../errors/createError";
import {UserRegistrationModel} from "../models/user.model";
import {IAuthenticatedRequest} from "./checkidHandler";


export async function validateGroupData(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try{
        if(!req.user){
            return next(createError('User not found', 404, 'USER_NOT_FOUND'));
        }

        const {name} = req.body
        const members = req.body.members as string[]
        const group = await checkFieldExists(GroupModel, 'name', name)

        if(group.isExists) {
            return next(createError('Group already exists', 400, 'GROUP_EXISTS'));
        }

        // if(!Array.isArray(members)  ) {
        //     return next(createError('Members must be a non-empty array', 400, 'INVALID_MEMBERS'));
        // }

        // const memberIds = members.map((member: string) => member.toString()) as string[]
        const creatorId = req.user._id.toString()
        if(!members.includes(creatorId)) {
            members.push(creatorId)
        }
        const uniqueMembers = Array.from(new Set(members))

        if(uniqueMembers.length !== members.length) {
            return next(createError('Members must be unique', 400, 'DUPLICATE_MEMBERS'));
        }

        await Promise.all(uniqueMembers.map(async(userId) => {
            const user = await checkFieldExists(UserRegistrationModel, '_id', userId);
            if (!user.isExists) {
                throw createError(`User with ID "${userId}" does not exist`, 400, 'USER_NOT_FOUND');
            }

        }))

        req.body.members = uniqueMembers
        req.body.creatorId = creatorId
        req.body.name = name

        next()
    }catch(error){
        console.log('Error in validate group data middleware:', error)
        next(error)
    }
}

