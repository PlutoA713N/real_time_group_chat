import {authenticationHandler} from "../middleware/authenticationHandler";
import {validateMessageHistoryRules, validateMessageRules, validateResult} from "../middleware/validateRules";
import {checkidHandler} from "../middleware/checkidHandler";
import {userMessageController} from "../controllers/user.message.controller";
import router from "./user.route";
import {getUserHistory} from "../controllers/user.history.controller";

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message to user or group
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               senderId:
 *                 type: string
 *                 example: 6824c3777fa6a0a2a410c0fd
 *               receiverId:
 *                 type: string
 *                 example: 68248f55f1b41aeceab2288e
 *               groupId:
 *                 type: string
 *               content:
 *                 type: string
 *                 example: Hello, world!
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
router.post("/api/messages", authenticationHandler, validateMessageRules, validateResult, checkidHandler, userMessageController)

router.get("/api/messages/history", authenticationHandler, validateMessageHistoryRules, validateResult, checkidHandler, getUserHistory )

export default router