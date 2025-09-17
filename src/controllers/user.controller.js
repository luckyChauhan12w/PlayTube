import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../services/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(
    async (req, res) => {

        // get user details from frontend 
        // validation - not empty 
        // check if user already exist: username, email
        // check for image, check for avatar 
        // upload them to cloudinary, aavatar 
        // create user object - create entry in db
        // remove passwod and refresh token field from response 
        // check for user creation 
        // return res

        const { username, fullName, email, password } = req.body

        console.log("user controller-->", req.files, req.body)
        const requiredFields = [fullName, email, username, password];
        const isMissing = requiredFields.some((field) => !field || field.trim() === "");

        if (isMissing) {
            throw new ApiError(400, "All fields are required");
        }

        const isUserExist = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserExist) {
            throw new ApiError(409, "User with email or username is already is exists")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path
        const coverImageLocalPath = req.files?.coverImage[0]?.path


        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar) {
            throw new ApiError(400, "Avatar file is not able to upload")
        }

        const user = await User.create({
            username: username.toLowerCase(),
            fullName,
            email,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
        })

        if (!user) {
            throw new ApiError(500, "Somting went wrong while registring the user")
        }

        return res.status(201).json(
            new ApiResponse(200, user, "User Created successfully")
        )

    }
)

export { registerUser }
