import request from "supertest";
import app from "./../../express/index";
import {runTestDb, closeTestDb} from "./../config/database";
import { UserRegistrationModel } from "../../models/user.model";

let user;

beforeAll(async () => {
    await runTestDb()
    user = new UserRegistrationModel({
        username: 'test',
        email: 'test@gmail.com',
        password: '$2b$10$D8HyxYXiC5/deD6bz8xLb.XqY1tzl3Uqtcb5fyPIgE74btkpUYd4W',
    })

    await user.save()
})


afterAll(async () => {
    await closeTestDb()
})

describe(' POST /user/login', () => {
    it('should return token after successful login', async() => {
        const res = await request(app)
            .post('/user/login')
            .send({
                email: 'test@gmail.com',
                password: 'Password123@',
            })

        expect(res.statusCode).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.token).toBeDefined()
    });


    it('should return error if user not found', async() => {
        const res = await request(app)
            .post('/user/login')
            .send({
                email: 'fake@gmail.com',
                password: 'password123',
            })

        expect(res.statusCode).toBe(401)
        expect(res.body.success).toBe(false)
        expect(res.body.code).toBe('INVALID_CREDENTIALS')
    })
})