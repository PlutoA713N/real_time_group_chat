// app.ts
import { run, closeDB } from "./config/database";
import app from "./express/index";
import { setupSocketIO } from "./sockets/index";
import { createServer } from "http";
import { Server } from "socket.io";
import { setSocketIOInstance } from "./sockets/io"
import { getEnv } from "./config/env";
import {initRedis, closeRedis} from "./redis/redisClient";
import { exit } from "process";
import { log, error } from "console";


const port = Number(getEnv("PORT", true, "5000"));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        credentials: true,
    }
});
setupSocketIO(io);
setSocketIOInstance(io)

const startServer = async () => {
    try {
        await run();
        await initRedis();
        httpServer.listen(port, () => {
            log("Server is running on PORT:", port);
        });
    } catch (err) {
        error("Failed to connect mongodb/Redis or start server:", err);
        exit(1);
    }
};

process.on("SIGTERM", async () => {
    log("Recieved SIGTERM signal, Closing MongoDB, Redis connnection...");
    try {
        await closeDB();
        await closeRedis();
        log("MongoDB connection closed");
    } catch (err) {
        error("Error closing MongoDB connection:", err);
        exit(1);
    } finally {
        exit(0);
    }
});

export { startServer };
