import request from "supertest";
import app from "./../../express/index";
import {runTestDb, closeTestDb} from "./../config/database";

beforeAll(async () => {
    await runTestDb()
})

afterAll(async () => {
    await closeTestDb()
})

describe(' POST User Register', () => {

    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/user/register')
            .send({
                username: 'test',
                email: 'test@example.com',
                password: 'password123',
            })

        expect(res.statusCode).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data.token).toBeDefined()
    })


    it('should not register a user with same email', async () => {
        const res = await request(app)
            .post('/user/register')
            .send({
                username: 'test',
                email: 'test@example.com',
                password: 'password123',
            })

        expect(res.statusCode).toBe(409)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toBe('username exists')
    })

})