import express, {Express, Request, NextFunction, Response} from "express"
import cors from "cors"
import {join} from "node:path";
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
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

setupSwaggerDocs(app)

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.redirect('/Architecture.html')
})

app.use('/user', userRoute)
app.use('/api', userMessagesRoute)

app.use((req: Request, res: Response) => {
    res.status(404).sendFile(join(__dirname, '../../public/404.html'))
})

app.use(errorHandler)

export default app