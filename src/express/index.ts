import express, { Express } from "express"
import cors from "cors"
import userRoute from "../routes/user.route";
import userMessagesRoute from "../routes/user.messages.route";
import {errorHandler} from "../middleware/errorHandler";
import {setupSwaggerDocs} from "./../swagger/swagger"

const app: Express = express()

app.use(cors({
    origin: '*',
    credentials: true,
}))

app.use(express.json())

setupSwaggerDocs(app)

app.use('/user', userRoute)
app.use(userMessagesRoute)

app.use(errorHandler)

export default app