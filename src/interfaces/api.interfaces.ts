export interface IMessageHistoryQuery {
    userId?: string;
    withUserId?: string;
    groupId?: string;
    page?: number;
    pageSize?: number;
}