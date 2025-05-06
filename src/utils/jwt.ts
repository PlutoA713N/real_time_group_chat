import {config} from "dotenv";
import { sign, verify } from "jsonwebtoken"
import { getEnv } from "./../config/env";

const SECRET_KEY = getEnv('JWT_SECRET_KEY')

if(!SECRET_KEY){
    throw new Error('JWT_SECRET_KEY is not defined in the environment!')
}

const jwtSign = async(payload: object) : Promise<string> => {
    try {
     const token = await sign(payload, SECRET_KEY,{
        algorithm: 'HS256',
        expiresIn: '24h'
     } )
     return token
    } catch (error) {
      console.error('JWT signing error:', error)
      throw new Error('Error in token generation:' + (error instanceof Error ? error.message : String(error)))
    }
    
}


const verifyJwtToken = async(token: string) : Promise<object | string> => {
    try {
        const decoded = await verify(token, SECRET_KEY)
        return decoded
    } catch (error) {
        throw new Error('Error in token verification:' + (error instanceof Error ? error.message : String(error)))
    }
}


export {verifyJwtToken, jwtSign}