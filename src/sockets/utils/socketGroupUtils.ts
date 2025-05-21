import { GroupModel } from "./../../models/group.model";

export async function handleGroupJoin(groupId: string, userId: string, socket: any) {
    try {
        const group = await GroupModel.findById(groupId);
        if (!group) {
            return socket.emit("error", { code: "GROUP_NOT_FOUND", message: "Group not found." });
        }

        if (!group.members.includes(userId)) {
            return socket.emit("error", { code: "NOT_A_MEMBER", message: "You are not a member of this group." });
        }

        if (!socket.rooms.has(groupId)) {
            socket.join(groupId);
            console.log(`User ${userId} joined group ${groupId}`);
        }

        console.log(`User ${userId} joined group ${groupId}`);

        socket.emit("group_joined", { message: "Successfully joined the group.", groupId });
    } catch (error) {
        console.error("Error in handleGroupJoin:", error);
        socket.emit("error", { code: "INTERNAL_ERROR", message: "Something went wrong while joining the group." });
    }
}

export async function autoJoinUserGroups(userId: string, socket: any) {
    try{

        if (socket.disconnected) {
            console.warn(`Socket for user ${userId} is already disconnected. Skipping autoJoin.`);
            return;
        }

        const groups = await GroupModel.find({ members: userId })
        for(const group of groups) {
            if(!socket.rooms.has(group._id.toString())) {
                socket.join(group._id.toString())
                console.log(`User ${userId} joined group ${group._id}`);
            }
        }
    }
    catch (error) {
        console.error("Error in autoJoinUserGroups:", error);
    }
}