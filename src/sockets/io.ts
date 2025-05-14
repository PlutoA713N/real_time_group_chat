// sockets/io.ts
import { Server } from "socket.io";

let io: Server;

export const setSocketIOInstance = (ioInstance: Server) => {
    io = ioInstance;
};

export const getSocketIOInstance = (): Server => {
    if (!io) {
        throw new Error("Socket.IO instance not initialized!");
    }
    return io;
};
