import { createGroupMessage } from "../../controllers/user.group.message.controller";
import { Response, NextFunction } from "express";
import { createSuccessResponse } from "../../errors/createSuccessResponse";
import { IGroup } from "../../models/group.model";
import { IAuthenticatedRequest } from "../../middleware/checkidHandler";
import {emitToGroup, emitToUser} from '../../sockets/utils/io.message.utils';


jest.mock('../../sockets/utils/io.message.utils', () => ({
    emitToGroup: jest.fn(),
}));

jest.mock("../../models/user.message.model", () => ({
    UserMessageModel: jest.fn().mockImplementation(function (this: any, data: any) {
        this.save = jest.fn().mockResolvedValue({
            _id: "message123",
            senderId: data.senderId,
            content: data.content,
            groupId: data.groupId,
        });
    }),
}));

import { UserMessageModel } from "../../models/user.message.model";

describe("createGroupMessage", () => {
    let req: Partial<IAuthenticatedRequest>;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: {
                senderId: "user1",
                content: "Hello group!",
            },
            params: {
                groupId: "group123"
            },
            group: {
                name: "Test Group",
                members: ["user1", "user2", "user3"],
                creatorId: "creator1"
            } as IGroup
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        next = jest.fn();
        jest.clearAllMocks();
    });

    it("should create and save a new group message", async () => {
        const expectedMessage = {
            _id: "message123",
            senderId: "user1",
            content: "Hello group!",
            groupId: "group123"
        };

        await createGroupMessage(req as IAuthenticatedRequest, res, next);

        expect(emitToGroup).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createSuccessResponse("message sent successfully", {
            success: true,
            groupName: "Test Group",
            message: expectedMessage
        }));

        expect(next).not.toHaveBeenCalled();
    });

    it("should handle errors correctly", async () => {
        const error = new Error("DB Error");

        (UserMessageModel as unknown as jest.Mock).mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(error)
        }));

        await createGroupMessage(req as IAuthenticatedRequest, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
