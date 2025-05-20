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
 * @swagger
 * /api/messages/history:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get Message History
 *     description: Retrieve message history between two users (direct messages) or within a group.
 *                  You must provide either `withUserId` or `groupId`, but not both.
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user requesting message history.
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
 *         description: A list of message objects with pagination metadata.
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
 *                   example: message history retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMessages:
 *                       type: integer
 *                       example: 5
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     requestPage:
 *                       type: integer
 *                       example: 4
 *                     clamped:
 *                       type: boolean
 *                       example: true
 *                     pageSize:
 *                       type: integer
 *                       example: 25
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       '400':
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 code:
 *                   type: string
 *                   example: VALIDATION_FAILED
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: userId
 *                       message:
 *                         type: string
 *                         example: Invalid userId
 *                       value:
 *                         type: string
 *                         example: "''\""
 *                       location:
 *                         type: string
 *                         example: query
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
 *                 example: "red room two"
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["68248f55f1b41aeceab2288e", "682c690bdd5846d3ccf08d61"]
 *               creatorId:
 *                 type: string
 *                 example: "682c690bdd5846d3ccf08d61"
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
 *                   example: "Group created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "682ca4fab7885586ad4fd968"
 *                     name:
 *                       type: string
 *                       example: "red room two"
 *                     members:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["68248f55f1b41aeceab2288e", "682c690bdd5846d3ccf08d61"]
 *                     creatorId:
 *                       type: string
 *                       example: "682c690bdd5846d3ccf08d61"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-20T15:51:22.294Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-20T15:51:22.294Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Validation error or duplicate group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 code:
 *                   type: string
 *                   example: "VALIDATION_FAILED"
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "members"
 *                       message:
 *                         type: string
 *                         example: "Members must be an array"
 *                       value:
 *                         type: object
 *                         example: {}
 *                       location:
 *                         type: string
 *                         example: "body"
 *       409:
 *         description: Group already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Group already exists"
 *                 code:
 *                   type: string
 *                   example: "GROUP_EXISTS"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/groups', authenticationHandler, validateGroupRequest, validateResult, validateGroupData, createGroup)

/**
 * @swagger
 * /api/groups/{groupId}/messages:
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
 *           example: 682c67e7dd5846d3ccf08d5e
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
 *                 example: 682c501d982e7da923e2104d
 *               content:
 *                 type: string
 *                 description: The content of the message being sent.
 *                 example: "Hello, everyone!, my 3rd message, this is kova again"
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
 *                 message:
 *                   type: string
 *                   example: message sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     groupName:
 *                       type: string
 *                       example: kova-group two
 *                     message:
 *                       type: object
 *                       properties:
 *                         senderId:
 *                           type: string
 *                           example: 682c501d982e7da923e2104d
 *                         groupId:
 *                           type: string
 *                           example: 682c67e7dd5846d3ccf08d5e
 *                         content:
 *                           type: string
 *                           example: "Hello, everyone!, my 3rd message, this is kova again"
 *                         _id:
 *                           type: string
 *                           example: 682ccc8d6234387739141274
 *                         createdAt:
 *                           type: string
 *                           example: "2025-05-20T18:40:13.796Z"
 *                         updatedAt:
 *                           type: string
 *                           example: "2025-05-20T18:40:13.796Z"
 *                         __v:
 *                           type: integer
 *                           example: 0
 *       400:
 *         description: Validation failed (e.g., invalid senderId).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 code:
 *                   type: string
 *                   example: VALIDATION_FAILED
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: senderId
 *                       message:
 *                         type: string
 *                         example: Invalid senderId
 *                       value:
 *                         type: string
 *                         example: "682c501d982e7da923e104d"
 *                       location:
 *                         type: string
 *                         example: body
 *       401:
 *         description: Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Missing token
 *                 code:
 *                   type: string
 *                   example: INVALID_AUTH_TOKEN
 *       404:
 *         description: Group not found or invalid group ID.
 *       500:
 *         description: Server error while processing the request.
 *     security:
 *       - bearerAuth: []
 */
router.post('/groups/:groupId/messages', authenticationHandler, validateGroupMessageRules, validateResult, validateGroupMessagesRequest,  createGroupMessage)

export default router