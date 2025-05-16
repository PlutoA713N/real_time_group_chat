import { Router } from "express";
import { registerUser } from "../controllers/user.registration.controller";
import { validateRegistrationRules, validateLoginRules, validateResult, validateMessageRules } from "../middleware/validateRules";
import { handleUserLogin } from "../controllers/user.login.controller";
import { authenticationHandler } from "../middleware/authenticationHandler";
import {userMessageController} from "../controllers/user.message.controller";
import {checkidHandler} from "../middleware/checkidHandler";

const router = Router();

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: apple
 *               email:
 *                 type: string
 *                 example: apple@gmail.com
 *               password:
 *                 type: string
 *                 example: Apple123#
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Username or email already exists
 *       500:
 *         description: Server error
 */
router.post("/register", validateRegistrationRules, validateResult, registerUser);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: apple@gmail.com
 *               password:
 *                 type: string
 *                 example: Apple123#
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validateLoginRules, validateResult, handleUserLogin)

export default router
