import {client} from "./redisClient";
import {convertToSeconds} from "../utils/jwt";

export async function storeUserToken (userId: string, token: string, expiryTime: string | number = '24h'): Promise<void>  {
    try{
        const time = convertToSeconds(expiryTime)
        await client.set(`user_token:${userId}`, token, {EX: time})
    }catch (e) {
        console.error('Error in storeUserToken function', e)
        throw e
    }
}

export async function getUserToken(userId: string) {
    try{
        return await client.get(`user_token:${userId}`)
    }catch (e) {
        console.error('Error in getUserToken function', e)
        throw e
    }
}


export async function deleteUserToken(userId: string): Promise<void> {
    try {
        await client.del(`user_token:${userId}`);
    } catch (e) {
        console.error('Error deleting user token:', e);
        throw e;
    }
}
