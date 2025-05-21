import {Request, Response, NextFunction} from "express";
import {GroupModel} from "../models/group.model";

export async function createGroup(req: Request, res: Response, next: NextFunction) {
    try{
        const {name, members, creatorId} = req.body

        const group = new GroupModel({
            name, members, creatorId
        })

        await group.save()

         res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: group
        })

        return

    }catch (e) {
        console.error('Error in create group function', e)
        next(e)
    }
}
