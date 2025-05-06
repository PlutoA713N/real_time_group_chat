import {Router} from "express";
import { registerUser } from "./../controllers/user.controller";
import { validateRegistrationRules, validateRegistration } from "../middleware/validateRegistration";

const router = Router();

router.post("/register", validateRegistrationRules, validateRegistration, registerUser);

export default router
