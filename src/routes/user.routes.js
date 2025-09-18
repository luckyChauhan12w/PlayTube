import { Router } from "express";
import { registerUser, loginUser, logOutUser, refreshAccessToken } from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

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
router.route("/login").post(loginUser)

// /api/v1/user/logout
router.route("/logout").post(verifyJWT, logOutUser)

// /api/v1/user/refresh-access-token
router.route("/refresh-access-token").post(refreshAccessToken)

export default router;