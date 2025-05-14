// socket/socket.ts
import { Server } from "socket.io";
import {IDecodedToken, verifyJwtToken} from "../utils/jwt";
import { createError } from "./utils/errorWrapper";

export const socketsBucket = new Map<string, Set<string>>();

export function setupSocketIO(io: Server) {
    io.use((socket, next) => {
        const token: string = socket.handshake.auth.token;
        const userId: string = socket.handshake.query.userId as string;

        if (!token) {
            return next(createError(401, "Missing authentication token"));
        }

        let user: IDecodedToken = {} as IDecodedToken;
        try{
             user = verifyJwtToken(token);
            if (!user || !user.userId) {
                return next(createError(401, "Invalid or expired token"));
            }
        }catch(error : any){
            return next(createError(401, error.message || "Invalid token"));
        }

        socket.data.user = user;
        socket.data.userId = userId;

        if (!socketsBucket.has(userId)) {
            socketsBucket.set(userId, new Set());
        }

        socketsBucket.get(userId)?.add(socket.id);

        next();
    });

    io.on("connection", (socket) => {
        console.log(`Socket ${socket.id} connected | User: ${socket.data.userId}`);

        socket.on("disconnect", () => {
            const socketSet = socketsBucket.get(socket.data.userId);
            socketSet?.delete(socket.id);
            if (socketSet?.size === 0) {
                socketsBucket.delete(socket.data.userId);
            }
            console.log("socket is disconnected");
        });
    });
}
