const createError = (code: number, message: string) => {
    let error = new Error(message);
    (error as any).data = {
        status: 'error',
        code: code,
        message: message,
    };
    return error;
}

export  {createError}