import {body, validationResult, ValidationChain, check, query, param} from "express-validator";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { createError } from "../errors/createError"
import {IMessageHistoryQuery} from "../interfaces/api.interfaces";

export const validateRegistrationRules: ValidationChain[] = [
  body("username")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Username is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 characters"),
];

export const validateLoginRules: ValidationChain[] = [
  
  body("email")
  .optional()
  .trim()
  .escape() 
  .isEmail()
  .withMessage("Invalid email address"),
  
  body("username")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Username is required"),
  
    body('username_or_email').custom((value, { req }) => {
      const { email, username } = req.body
      if (!email && !username) {
        throw new Error("Either email or username should be provided");
      }
      return true
    }),
  
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 characters"),
  

];

export  const validateMessageRules: ValidationChain[] = [

  body('senderId')
      .notEmpty().withMessage('senderId is required')
      .bail()
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid senderId');
        }
        return true;
      }),


  body('receiverId')
      .optional({ checkFalsy: true })
      .bail()
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid receiverId');
        }
        return true;
      }),


  body('groupId')
      .optional({ checkFalsy: true })
      .bail()
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid groupId');
        }
        return true;
      }),
  
    body('receiverId_or_groupId').custom((value, { req }) => {
      const { receiverId, groupId } = req.body
      if (!receiverId && !groupId) {
        throw new Error("Either receiverId or groupId should be provided");
      }
      return true
    }),
  
  body('content')
      .notEmpty()
      .withMessage('Invalid content')
      .trim()
      .escape()

]

export  const validateMessageHistoryRules: ValidationChain[] = [
    query('userId')
        .trim()
        .notEmpty().withMessage('userId is required')
        .bail()
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid userId');
            }
            return true;
        }),


    query('withUserId')
        .optional({ checkFalsy: true })
        .trim()
        .bail()
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid withUserId');
            }
            return true;
        }),


    query('groupId')
        .optional({ checkFalsy: true })
        .trim()
        .bail()
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid groupId');
            }
            return true;
        }),

    query().custom((_, { req }) => {
        const { withUserId, groupId } = req.query as IMessageHistoryQuery
        if (!withUserId && !groupId) {
            throw new Error("Either withUserId or groupId should be provided");
        }
        return true
    }),

    query('page')
        .optional({checkFalsy: true})
        .isInt({min: 1})
        .withMessage('Page must be a positive integer')
        .toInt(),

    query('pageSize')
        .optional({checkFalsy: true})
        .isInt({min: 25, max: 100})
        .withMessage('Page size must be a positive integer')
        .toInt()
]

export const validateGroupRequest = [
    body('name')
        .isString()
        .trim()
        .escape()
        .withMessage('Group name must be a string')
        .notEmpty()
        .withMessage('Group name is required'),

    body('members')
        .isArray()
        .withMessage('Members must be an array')
        .bail()
        .custom((members) => {
            members.forEach((member: any) => {
                if (typeof member !== 'string') {
                    throw new Error(`Member ID must be a string, but received "${typeof member}"`);
                }
                if (!mongoose.Types.ObjectId.isValid(member)) {
                    throw new Error(`Invalid ObjectId for member: "${member}"`);
                }
            });

            return true;
        })
]

export const validateGroupMessageRules = [
    param('groupId')
        .notEmpty()
        .withMessage('Group ID is required')
        .bail()
        .custom((id) => mongoose.isValidObjectId(id))
        .withMessage('Invalid group ID'),

    body('senderId')
        .notEmpty()
        .withMessage('senderId is required')
        .bail()
        .trim()
        .custom((value) => mongoose.isValidObjectId(value))
        .withMessage('Invalid senderId')
        .escape(),

    body('content')
        .notEmpty()
        .withMessage('Invalid content')
        .isString()
        .withMessage('Content must be a string')
        .trim()
        .isLength({ min: 1 })
        .withMessage(
            'Content must be more than one character long')
        .escape(),

]

export const validateResult = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array().map((e: any) => ({
        field: e.path,
        message: e.msg,
        value: e.value,
        location: e.location
      }))
      return next(createError('Validation failed', 400, 'VALIDATION_FAILED', error));
    } else {
      next()
    }
  } catch (error) {
    console.error(error)
    next(createError("Internal server error during validation", 500));
  }
};