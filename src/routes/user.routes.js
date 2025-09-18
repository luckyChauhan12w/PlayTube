import { Router } from "express";
import { registerUser, login } from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

// /api/v1/user/register
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

// /api/v1/user/login
router.route("/login").post(login)

export default router;