import {authenticationHandler} from "../middleware/authenticationHandler";
import {
    validateGroupMessageRules,
    validateGroupRequest,
    validateMessageHistoryRules,
    validateMessageRules,
    validateResult
} from "../middleware/validateRules";
import {
    checkHistoryIdsFromQuery,
    checkMessageIdsFromBody,
    validateGroupMessagesRequest
} from "../middleware/checkidHandler";
import {userMessageController} from "../controllers/user.message.controller";
import router from "./user.route";
import {getUserHistory} from "../controllers/user.history.controller";
import {validateGroupData} from "../middleware/validateGroupData";
import {createGroup} from "../controllers/user.group.controller";
import {createGroupMessage} from "../controllers/user.group.message.controller";

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
router.post("/messages", authenticationHandler, validateMessageRules, validateResult, checkMessageIdsFromBody, userMessageController)

/**
 * @openapi
 * /api/messages/history:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get Message History
 *     description: Retrieve message history between two users or within a group.
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose message history is being retrieved.
 *       - name: withUserId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the other user for direct messages.
 *       - name: groupId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the group for group messages.
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: The page number for pagination.
 *       - name: pageSize
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 25
 *           maximum: 100
 *           default: 25
 *         description: The number of messages per page.
 *     responses:
 *       '200':
 *         description: A list of message objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message history retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMessages:
 *                       type: integer
 *                       example: 45
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 25
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       '400':
 *         description: Invalid query parameters
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/messages/history", authenticationHandler, validateMessageHistoryRules, validateResult, checkHistoryIdsFromQuery, getUserHistory )

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - members
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Study Buddies"
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["663c3df9c5fbd9e2dc1f9411", "663c3e0ec5fbd9e2dc1f9412"]
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Group created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Validation error or duplicate group
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/groups', authenticationHandler, validateGroupRequest, validateResult, validateGroupData, createGroup)

/**
 * @swagger
 * /groups/{groupId}/messages:
 *   post:
 *     summary: Send a message to a group
 *     description: This endpoint allows sending a message to a specific group.
 *     tags:
 *       - Group Messages
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: The ID of the group to send the message to.
 *         schema:
 *           type: string
 *           example: 60a78845b54b1f001f1d9d5b  # example group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - content
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: The ID of the user sending the message.
 *                 example: 60a79d56b3d50a001f1b9d6a  # example sender ID
 *               content:
 *                 type: string
 *                 description: The content of the message being sent.
 *                 example: "Hello, everyone!"  # example content
 *     responses:
 *       200:
 *         description: Message successfully sent to the group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 groupName:
 *                   type: string
 *                   example: "General Chat"  # example group name
 *                 message:
 *                   type: object
 *                   properties:
 *                     senderId:
 *                       type: string
 *                       example: 60a79d56b3d50a001f1b9d6a
 *                     content:
 *                       type: string
 *                       example: "Hello, everyone!"
 *                     groupId:
 *                       type: string
 *                       example: 60a78845b54b1f001f1d9d5b
 *                     timestamp:
 *                       type: string
 *                       example: "2025-05-19T00:00:00Z"  # example timestamp
 *       400:
 *         description: Invalid request, missing or incorrect data.
 *       404:
 *         description: Group not found or invalid group ID.
 *       500:
 *         description: Server error while processing the request.
 *     security:
 *       - bearerAuth: []  # assumes the use of bearer token for authentication
 */
router.post('/groups/:groupId/messages', validateGroupMessageRules, validateResult, validateGroupMessagesRequest,  createGroupMessage)

export default router