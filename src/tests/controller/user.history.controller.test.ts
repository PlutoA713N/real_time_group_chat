import {Request, Response, NextFunction} from 'express';
import {getUserHistory} from './../../controllers/user.history.controller';
import {UserMessageModel} from './../../models/user.message.model';
import {createSuccessResponse} from "../../errors/createSuccessResponse";

jest.mock('./../../models/user.message.model');
jest.mock('./../../errors/createSuccessResponse');


describe('User History Controller', () => {
    const mockReq = (query: any): Partial<Request> => ({
        query
    });

    const mockRes = (): Partial<Response> => {
        const res: any = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    const next = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })


    it('should get a history of messages between two users', async () => {
        const req = mockReq({
            userId: 'user1',
            withUserId: 'user2',
            page: '1',
            pageSize: '2'
        }) as Request;

        const res = mockRes() as Response;

        const savedMessage = [
            { senderId: "user1", receiverId: "user2", groupId: "", content: "hello" },
            { senderId: "user1", receiverId: "user2", groupId: "", content: "hello user2" }
        ];

        // Mock countDocuments
        (UserMessageModel.countDocuments as jest.Mock).mockResolvedValue(savedMessage.length);

        // Mock find with chained methods
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(savedMessage) // Limit should resolve the saved messages
        });

        (UserMessageModel.find as jest.Mock) = mockFind;  // Replace find with the mock

        await getUserHistory(req, res, next);

        expect(UserMessageModel.countDocuments).toHaveBeenCalledWith({
            senderId: 'user1',
            receiverId: 'user2',
        });

        expect(mockFind).toHaveBeenCalled();

        // Corrected status code to 200
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            createSuccessResponse('message history retrieved successfully', expect.objectContaining({
                totalMessages: 2,
                totalPages: 1,
                currentPage: 1,
                requestPage: 1,
                pageSize: 2,
                messages: savedMessage
            }))
        );
    });

    it('should get a history of messages in a group', async () => {
        const req = mockReq({
            userId: 'user1',
            groupId: 'group123',
            page: '1',
            pageSize: '2'
        }) as Request;

        const res = mockRes() as Response;

        const savedMessage = [{ senderId: "user1", groupId: "group123", content: "group msg" }];

        (UserMessageModel.countDocuments as jest.Mock).mockResolvedValue(1);
        (UserMessageModel.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValueOnce(savedMessage)
        });

        await getUserHistory(req, res, next);

        expect(UserMessageModel.countDocuments).toHaveBeenCalledWith({
            senderId: 'user1',
            groupId: 'group123'
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            createSuccessResponse(expect.any(String), expect.objectContaining({
                messages: savedMessage
            }))
        );
    });


    it('should clamp requested page if it exceeds total pages', async () => {
        const req = mockReq({
            userId: 'user1',
            withUserId: 'user2',
            page: '5',         // too high
            pageSize: '2'
        }) as Request;

        const res = mockRes() as Response;

        const savedMessage = [{ senderId: "user1", receiverId: "user2", content: "clamped" }];

        (UserMessageModel.countDocuments as jest.Mock).mockResolvedValue(2);
        (UserMessageModel.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValueOnce(savedMessage)
        });

        await getUserHistory(req, res, next);

        expect(res.json).toHaveBeenCalledWith(
            createSuccessResponse(expect.any(String), expect.objectContaining({
                clamped: true,
                currentPage: 1,    // clamped to last valid page
                requestPage: 5
            }))
        );
    });


    it('should handle no messages found', async () => {
        const req = mockReq({
            userId: 'user1',
            withUserId: 'user2'
        }) as Request;

        const res = mockRes() as Response;

        (UserMessageModel.countDocuments as jest.Mock).mockResolvedValue(0);
        (UserMessageModel.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValueOnce([])
        });

        await getUserHistory(req, res, next);

        expect(res.json).toHaveBeenCalledWith(
            createSuccessResponse(expect.any(String), expect.objectContaining({
                totalMessages: 0,
                messages: []
            }))
        );
    });


    it('should handle database errors gracefully', async () => {
        const req = mockReq({
            userId: 'user1',
            withUserId: 'user2'
        }) as Request;

        const res = mockRes() as Response;

        const dbError = new Error('DB failure');
        (UserMessageModel.countDocuments as jest.Mock).mockRejectedValue(dbError);

        await getUserHistory(req, res, next);

        expect(next).toHaveBeenCalledWith(dbError);
    });

})


