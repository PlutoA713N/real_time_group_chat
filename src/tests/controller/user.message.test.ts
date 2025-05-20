import { userMessageController } from "./../../controllers/user.message.controller";
import { UserMessageModel } from "./../../models/user.message.model";
import { GroupModel } from "./../../models/group.model";
import {emitToGroup, emitToUser} from "./../../sockets/utils/io.message.utils";
import { AppError } from "./../../errors/AppError";
import { createSuccessResponse } from "./../../errors/createSuccessResponse";

jest.mock("./../../models/user.message.model");
jest.mock("./../../models/group.model");
jest.mock("./../../sockets/utils/io.message.utils");
jest.mock("./../../errors/createSuccessResponse");
jest.mock("./../../errors/AppError");

describe("userMessageController", () => {
    const mockReq = (body: any, group: any = null) => ({
        body,
        group
    } as any);

    const mockRes = () => {
        const res: any = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should send a direct message and emit to receiver", async () => {
        const req = mockReq({
            senderId: "user1",
            receiverId: "user2",
            content: "hello"
        });

        const res = mockRes();

        const savedMessage = { senderId: "user1", receiverId: "user2", groupId: "", content: "hello" };

        jest.spyOn(UserMessageModel.prototype, "save").mockResolvedValue(savedMessage);

        (createSuccessResponse as jest.Mock).mockReturnValue({ message: "ok", data: { newMessage: savedMessage } });

        await userMessageController(req, res, next);

        expect(emitToUser).toHaveBeenCalledWith("user2", "message", savedMessage);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "ok", data: { newMessage: savedMessage } });
    });

    it("should send a group message to all members", async () => {
        const req = mockReq({
            senderId: "user1",
            groupId: "group123",
            content: "group message"
        }, {
            name: "Test Group",
            members: ["user1", "user2", "user3"]
        });

        const res = mockRes();

        const savedMessage = { senderId: "user1", groupId: "group123", content: "group message" };

        jest.spyOn(UserMessageModel.prototype, "save").mockResolvedValue(savedMessage);
        (createSuccessResponse as jest.Mock).mockReturnValue({ message: "ok", data: { message: savedMessage } });

        await userMessageController(req, res, next);

        expect(emitToGroup).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201); // Adjusted expected status code
    });

    it("should throw error if group not found", async () => {
        const req = mockReq({
            senderId: "user1",
            groupId: "group123",
            content: "test"
        });

        const res = mockRes();

        // Simulate group not found by returning null
        (GroupModel.findById as jest.Mock).mockResolvedValue(null);

        req.group = null; // Explicitly set group to null

        await userMessageController(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
});
