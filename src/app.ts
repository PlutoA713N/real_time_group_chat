// app.ts
import { run, closeDB } from "./config/database";
import app from "./express/index";
import { setupSocketIO } from "./sockets/index"; // 👈 renamed import
import { createServer } from "http";
import { Server } from "socket.io";
import { setSocketIOInstance } from "./sockets/io"
import { log, error } from "console";
import { exit } from "process";
import { getEnv } from "./config/env";

const port = Number(getEnv("PORT", true, "5000"));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        credentials: true,
    }
});
setupSocketIO(io);
setSocketIOInstance(io)// ✅ Setup your socket logic

const startServer = async () => {
    try {
        await run();
        httpServer.listen(port, () => {
            log("Server is running on PORT:", port);
        });
    } catch (err) {
        error("Failed to connect mongodb or start server:", err);
        exit(1);
    }
};

process.on("SIGTERM", async () => {
    log("Recieved SIGTERM signal, Closing MongoDB connnection...");
    try {
        await closeDB();
        log("MongoDB connection closed");
    } catch (err) {
        error("Error closing MongoDB connection:", err);
        exit(1);
    } finally {
        exit(0);
    }
});

export { startServer };
