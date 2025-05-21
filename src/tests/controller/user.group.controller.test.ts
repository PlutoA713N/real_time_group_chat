import { createGroup } from '../../controllers/user.group.controller';
import { Request, Response, NextFunction } from 'express';
import { GroupModel } from '../../models/group.model';

// Mock the constructor
jest.mock('../../models/group.model', () => {
    return {
        GroupModel: jest.fn(),
    };
});

describe('createGroup controller', () => {
    const mockReq = (body: any): Partial<Request> => ({ body });

    const mockRes = (): Partial<Response> => {
        const res: any = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a group successfully and return 201', async () => {
        const req = mockReq({
            name: 'Test Group',
            members: ['user1', 'user2'],
            creatorId: 'user1',
        }) as Request;

        const res = mockRes() as Response;

        const mockSave = jest.fn().mockResolvedValue({});
        const mockGroupInstance = {
            save: mockSave,
            name: 'Test Group',
            members: ['user1', 'user2'],
            creatorId: 'user1',
        };

        // Make GroupModel constructor return our mock instance
        (GroupModel as unknown as jest.Mock).mockImplementation(() => mockGroupInstance);

        await createGroup(req, res, next);

        expect(GroupModel).toHaveBeenCalledWith({
            name: 'Test Group',
            members: ['user1', 'user2'],
            creatorId: 'user1',
        });

        expect(mockSave).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Group created successfully',
            data: mockGroupInstance,
        });
    });

    it('should call next with error if group save fails', async () => {
        const req = mockReq({
            name: 'Fail Group',
            members: ['userX'],
            creatorId: 'userX',
        }) as Request;

        const res = mockRes() as Response;

        const mockError = new Error('DB failure');
        const mockSave = jest.fn().mockRejectedValue(mockError);

        const mockGroupInstance = {
            save: mockSave,
            name: 'Fail Group',
            members: ['userX'],
            creatorId: 'userX',
        };

        (GroupModel as unknown as jest.Mock).mockImplementation(() => mockGroupInstance);

        await createGroup(req, res, next);

        expect(GroupModel).toHaveBeenCalled();
        expect(mockSave).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(mockError);
    });
});
