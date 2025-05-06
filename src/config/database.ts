import { connect, connection } from "mongoose";
import { log, error } from "console";
import { AppError } from "./../errors/AppError";
import { getEnv } from "./env";

const uri = getEnv('MONGO_URI')

const connnectDB = async (): Promise<void> => {
    try {
        await connect(uri)
        log('Connected to MongoDB')
    } catch (err) {
        error('Failed to connect to Mongodb:', err)
        throw new AppError(
            `Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
            500,
            'DB_CONNECTION_ERROR'
        );
    }

}

const closeDB = async (): Promise<void> => {
    try {
        await connection.close()
        log('Closed MongoDB connection')
    } catch (err) {
        error('Failed to close MongoDB:', err)
        throw new AppError(`Database disconnection failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 500, 'DB_DISCONNECTION_ERROR')
    }
}



const run = async (): Promise<void> => {
    try {
        await connnectDB()
        await connection.db?.admin().command({ ping: 1 })
        log("Pinged your deployment. You successfully connnected to mongoDB!")
    } catch (err) {
        error("Failed to ping MongoDB:", err)
        throw new AppError(
            `MongoDB ping failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
            500,
            'DB_PING_ERROR'
        );
    }
}


export { run, connnectDB, closeDB };