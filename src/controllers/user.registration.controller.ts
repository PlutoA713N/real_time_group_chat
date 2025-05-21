import { NextFunction, Request, Response } from "express";
import { UserRegistrationModel } from "../models/user.model";
import { generateHash } from "../utils/auth";
import { checkFieldExists } from "../models/dbOperations";
import { log } from "console";
import { jwtSign } from "../utils/jwt";
import { createError } from "../errors/createError";
import { createSuccessResponse } from "../errors/createSuccessResponse";
import {storeUserToken} from "../redis/redisUtils";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await generateHash(password);

    const userData = new UserRegistrationModel({
      username,
      email,
      password: hashedPassword,
    });

    const usernameInDB = await checkFieldExists(UserRegistrationModel,"username", username);

    if (usernameInDB.isExists) {
      const error = createError(usernameInDB.message, 409, "USERNAME_EXISTS");
      return next(error)
    }

    const emailInDB = await checkFieldExists(UserRegistrationModel,"email", email);

    if (emailInDB.isExists) {
      const error = createError(emailInDB.message, 409, "EMAIL_EXISTS");
      return next(error)
    }

    await userData.save();

    const payload = {
      userId: userData._id.toString(),
      username: userData.username,
      email: userData.email,
      createdAt: userData.createdAt,
    };

    const jwtToken =  jwtSign(payload);
    await  storeUserToken(userData._id.toString(), jwtToken, )

    res.status(201).json(createSuccessResponse("User registered successfully", {
      token: jwtToken,
      userId: userData._id.toString(),
    }));

  } catch (err: any) {
    log("Error during user registration:", err);
    next(err)
  }
};

export { registerUser };