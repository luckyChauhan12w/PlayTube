import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";


export const verifyJWT = asyncHandler(async (req, res, next) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    if (!decodedToken) {
        throw new ApiError(401, "access token is not valid")
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    req.user = user
    next()
})

export { verifyJWT }