// socket/socket.ts
import { Server } from "socket.io";
import {IDecodedToken, verifyJwtToken} from "../utils/jwt";
import { createError } from "./utils/errorWrapper";
import {autoJoinUserGroups, handleGroupJoin} from "./utils/socketGroupUtils";

export const socketsBucket = new Map<string, Set<string>>();

export function setupSocketIO(io: Server) {
    io.use((socket, next) => {
        const token: string = socket.handshake.auth.token;

        if (!token) {
            return next(createError(401, "Missing authentication token"));
        }

        let user: IDecodedToken = {} as IDecodedToken;
        let userId: string
        try{
             user = verifyJwtToken(token);
             console.log("user:", user);
            if (!user || !user.userId) {
                return next(createError(401, "Invalid or expired token"));
            }
            userId = user.userId;
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

    io.on("connection",  (socket) => {
        console.log(`Socket ${socket.id} connected | User: ${socket.data.userId}`);

         autoJoinUserGroups(socket.data.userId, socket);

        socket.on("join_group", async (groupId) => {
            if (!groupId) {
                return socket.emit("error", { code: "GROUP_ID_MISSING", message: "Group ID is required." });
            }
            await handleGroupJoin(groupId, socket.data.userId, socket )
        })

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
