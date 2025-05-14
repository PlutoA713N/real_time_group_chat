import {getSocketIOInstance} from "./../../sockets/io"
import {socketsBucket} from "../index";

const emitToUser = (userId: string, event: string, payload: any) => {
    const io = getSocketIOInstance()
    const socketIds  = socketsBucket.get(userId)
    if(!socketIds) return
    for (const id of socketIds) {
        io.to(id).emit(event, payload);
    }
}

export {emitToUser}

