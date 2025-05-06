import express, { Express } from "express"
import { run, closeDB } from "./config/database";
import userRoute from "./routes/user.route";
import { errorHandler } from "./middleware/errorHandler";
import { log, error } from "console"
import { exit } from "process";
import { getEnv } from "./config/env";

const app: Express = express()
const port = Number(getEnv('PORT', true, '5000'))

const startServer = async () => {
    try {
        await run()

        app.use(express.json())
        app.use('/user', userRoute)

        app.use(errorHandler) // Added at last

        app.listen(port, () => {
            log('Server is running on PORT:', port)
        })
    } catch (err) {
        error('Failed to connect mongodb or start server:', err)
        exit(1)
    }
}

startServer()

process.on('SIGTERM', async () => {
    log('Recieved SIGTERM signal, Closing MongoDB connnection...')
    try {
        await closeDB()
        log('MongoDB connection closed')
    } catch (err) {
        error('Error closing MongoDB connection:', err)
        exit(1)
    } finally {
        exit(0)
    }
})

export default startServer;