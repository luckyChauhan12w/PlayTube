import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js"
import upload from "../middleware/multer.middleware.js"

const router = Router()

// /api/v1/user/register
router.route("/register").post(registerUser)


router.route("/login").post(upload.fields({
    name: "avatar",
    maxCount: 1
}, {
    name: "coverImage",
    maxCount: 1
}), registerUser)

export default router