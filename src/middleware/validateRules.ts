import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { createError } from "../errors/createError";

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
  // body('senderId')
  //     .notEmpty()
  //     .trim()
  //     .escape()
  //     .withMessage('Invalid senderId'),

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