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
 *     summary: Send a message to a user or a group
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
 *                 example: ""
 *               content:
 *                 type: string
 *                 example: Hello, world!
 *     responses:
 *       201:
 *         description: Message sent successfully
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
 *                     message:
 *                       type: object
 *                       properties:
 *                         senderId:
 *                           type: string
 *                           example: 68271c25d32a93242a46fe78
 *                         receiverId:
 *                           type: string
 *                           example: 68248f55f1b41aeceab2288e
 *                         groupId:
 *                           type: string
 *                           example: ""
 *                         content:
 *                           type: string
 *                           example: Hello, world!
 *                         _id:
 *                           type: string
 *                           example: 682dbccc019bfd9ac2af1d18
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-05-21T11:45:16.783Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-05-21T11:45:16.783Z
 *                         __v:
 *                           type: number
 *                           example: 0
 *       400:
 *         description: Validation failed (e.g., receiverId or groupId missing)
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
 *                         example: receiverId_or_groupId
 *                       message:
 *                         type: string
 *                         example: Either receiverId or groupId should be provided
 *                       location:
 *                         type: string
 *                         example: body
 *       401:
 *         description: Missing or invalid token
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
 *                   example: "Missing or invalid token"
 *                 code:
 *                   type: string
 *                   example: INVALID_AUTH_TOKEN
 *       404:
 *         description: Group not found
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
 *                   example: group does not exist
 *                 code:
 *                   type: string
 *                   example: GROUP_NOT_FOUND
 *       500:
 *         description: Internal server error
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
 *                   example: An unexpected error occurred
 *                 code:
 *                   type: string
 *                   example: INTERNAL_SERVER_ERROR
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
 *       401:
 *         description: Missing or invalid token
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
 *                   example: "Missing or invalid token"
 *                 code:
 *                   type: string
 *                   example: INVALID_AUTH_TOKEN
 *       500:
 *         description: Internal server error
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
 *                   example: An unexpected error occurred
 *                 code:
 *                   type: string
 *                   example: INTERNAL_SERVER_ERROR
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
 *                       example: "2025-05-21T12:30:45Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-21T12:30:45Z"
 *       400:
 *         description: Validation failed (e.g., missing required fields)
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
 *                   example: VALIDATION_FAILED
 *       401:
 *         description: Missing or invalid token
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
 *                   example: "Missing or invalid token"
 *                 code:
 *                   type: string
 *                   example: INVALID_AUTH_TOKEN
 *       404:
 *         description: Creator or member not found
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
 *                   example: "User not found"
 *                 code:
 *                   type: string
 *                   example: USER_NOT_FOUND
 *       500:
 *         description: Internal server error
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
 *                   example: "An unexpected error occurred"
 *                 code:
 *                   type: string
 *                   example: INTERNAL_SERVER_ERROR
 */
router.post('/groups', authenticationHandler, validateGroupRequest, validateResult, validateGroupData, createGroup)

/**
 * @swagger
 * /api/groups/messages:
 *   post:
 *     summary: Send a message to a group
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
 *               - groupId
 *               - content
 *             properties:
 *               senderId:
 *                 type: string
 *                 example: "6824c3777fa6a0a2a410c0fd"
 *               groupId:
 *                 type: string
 *                 example: "682c690bdd5846d3ccf08d61"
 *               content:
 *                 type: string
 *                 example: "Hello everyone, welcome to the group!"
 *     responses:
 *       201:
 *         description: Group message sent successfully
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
 *                   example: "Group message sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     senderId:
 *                       type: string
 *                       example: "6824c3777fa6a0a2a410c0fd"
 *                     groupId:
 *                       type: string
 *                       example: "682c690bdd5846d3ccf08d61"
 *                     content:
 *                       type: string
 *                       example: "Hello everyone, welcome to the group!"
 *                     _id:
 *                       type: string
 *                       example: "682dbccc019bfd9ac2af1d18"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-21T11:45:16.783Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-21T11:45:16.783Z"
 *                     __v:
 *                       type: number
 *                       example: 0
 *       400:
 *         description: Validation failed (e.g., missing groupId or content)
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
 *                   example: VALIDATION_FAILED
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: groupId
 *                       message:
 *                         type: string
 *                         example: "GroupId is required"
 *                       location:
 *                         type: string
 *                         example: body
 *       401:
 *         description: Missing or invalid token
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
 *                   example: "Missing or invalid token"
 *                 code:
 *                   type: string
 *                   example: INVALID_AUTH_TOKEN
 *       404:
 *         description: Group not found
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
 *                   example: "Group not found"
 *                 code:
 *                   type: string
 *                   example: GROUP_NOT_FOUND
 *       500:
 *         description: Internal server error
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
 *                   example: "An unexpected error occurred"
 *                 code:
 *                   type: string
 *                   example: INTERNAL_SERVER_ERROR
 */
router.post('/groups/:groupId/messages', authenticationHandler, validateGroupMessageRules, validateResult, validateGroupMessagesRequest,  createGroupMessage)

export default router