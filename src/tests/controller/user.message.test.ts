import { userMessageController } from "./../../controllers/user.message.controller";
import { UserMessageModel } from "./../../models/user.message.model";
import { GroupModel } from "./../../models/group.model";
import { emitToUser } from "./../../sockets/utils/io.message.utils";
import { AppError } from "./../../errors/AppError";
import { createSuccessResponse } from "./../../errors/createSuccessResponse";

jest.mock("./../../models/user.message.model");
jest.mock("./../../models/group.model");
jest.mock( "./../../sockets/utils/io.message.utils");
jest.mock("./../../errors/createSuccessResponse");
jest.mock("./../../errors/AppError");

describe("userMessageController", () => {
    const mockReq = (body: any) => ({
        body
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

        const savedMessage = {  senderId: "user1", receiverId: "user2", groupId: "", content: "hello" };

        jest.spyOn(UserMessageModel.prototype, "save").mockResolvedValue(savedMessage);

        (createSuccessResponse as jest.Mock).mockReturnValue({ message: "ok", data: { newMessage: savedMessage } });

        await userMessageController(req, res, next);

        expect(emitToUser).toHaveBeenCalledWith("user2", "message", savedMessage);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "ok", data: { newMessage: savedMessage } });
    });

    it("should send a group message to all members", async () => {
        const req = mockReq({
            senderId: "user1",
            groupId: "group123",
            content: "group message"
        });

        const res = mockRes();

        const savedMessage = { senderId: "user1", groupId: "group123", content: "group message" };

        (UserMessageModel as any).mockImplementation(() => ({
            ...savedMessage,
            save: jest.fn().mockResolvedValue(savedMessage)
        }));

        const saveMock = jest.fn().mockResolvedValue(savedMessage);
        (UserMessageModel as any).mockImplementation(() => ({
            save: saveMock
        }));

        (GroupModel.findById as jest.Mock).mockResolvedValue({
            members: ["user1", "user2", "user3"]
        });

        (createSuccessResponse as jest.Mock).mockReturnValue({ message: "ok", data: { message: savedMessage } });

        await userMessageController(req, res, next);

        expect(emitToUser).toHaveBeenCalledTimes(3);
        expect(emitToUser).toHaveBeenCalledWith("user1", "message", savedMessage);
        expect(emitToUser).toHaveBeenCalledWith("user2", "message", savedMessage);
        expect(emitToUser).toHaveBeenCalledWith("user3", "message", savedMessage);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should throw error if group not found", async () => {
        const req = mockReq({
            senderId: "user1",
            groupId: "group123",
            content: "test"
        });

        const res = mockRes();

        (UserMessageModel as any).mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({})
        }));

        (GroupModel.findById as jest.Mock).mockResolvedValue(null);

        await userMessageController(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
});
