import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
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

export const validateRegistration = (
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