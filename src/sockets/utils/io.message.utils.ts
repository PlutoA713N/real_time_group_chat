import {getSocketIOInstance} from "./../../sockets/io"
import {socketsBucket} from "../index";

const emitToUser = (userId: string, event: string, payload: any) => {
    try{
        const io = getSocketIOInstance()
        const socketIds  = socketsBucket.get(userId)
        if(!socketIds || socketIds.size === 0){
            console.warn(`[Socket] No active sockets found for user ${userId}`);
            return
        }
        for (const socketId of socketIds) {
            try{
                io.to(socketId).emit(event, payload);
            }
            catch(err){
                console.error(`[Socket] Failed to emit to socket ${socketId}:`, err);            }
        }
    }catch(err){
        console.error(`[Socket] Unexpected error in emitToUser(${userId}):`, err);
    }

}

export {emitToUser}

