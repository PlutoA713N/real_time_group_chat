export interface SuccessResponse<T = any> {
    success: true;
    message: string;
    data: T;
}


export function createSuccessResponse<T = any>(message: string, data: T): SuccessResponse<T>{
    return {
        success: true,
        message,
        ...(data && {data})
    }
}

