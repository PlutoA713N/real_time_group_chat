import express, { Express } from "express"
import userRoute from "../routes/user.route";
import {errorHandler} from "../middleware/errorHandler";
import {setupSwaggerDocs} from "./../swagger/swagger"

const app: Express = express()

app.use(express.json())

setupSwaggerDocs(app)

app.use('/user', userRoute)

app.use(errorHandler)

export default app