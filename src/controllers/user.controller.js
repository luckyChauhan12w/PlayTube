import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../services/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "User not found to generate access and refresh token")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

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

        console.log(req.body)

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

        let coverImageLocalPath;
        if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        // console.log(avatar)
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required")
        }

        let coverImage = null;

        if (coverImageLocalPath) {
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath)


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

const loginUser = asyncHandler(
    async (req, res) => {
        const { username, email, password } = req.body

        if (!username || !email) {
            throw new ApiError(400, "Username or email is required")
        }

        if (!password) {
            throw new ApiError(400, "Password is required")
        }

        // console.log(user)

        const user = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password)

        if (!isPasswordCorrect) {
            throw new ApiError(401, "password is incorrect")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const logInUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            coverImage: user.coverImage
        }

        const option = {
            httpOnly: true,
            secure: true,
        }

        return res
            .cookie("refreshToken", refreshToken, option)
            .cookie("accessToken", accessToken, option)
            .status(200)
            .json(
                new ApiResponse(200, { user: logInUser, accessToken, refreshToken }, "Login successfully")
            )
    }
)

const logOutUser = asyncHandler(async (req, res) => {

    const userId = req.user._id

    console.log(userId)

    await User.findByIdAndUpdate(
        userId,
        { $set: { refreshToken: "" } },
        { new: true, runValidators: true }
    )

    const option = {
        httpOnly: true,
        secure: true,
        // expires: new Date(0)
    }

    return res.clearCookie("refreshToken", option)
        .clearCookie("accessToken", option)
        .status(200)
        .json(new ApiResponse(200, "User logged out successfully"));

})

export { registerUser, loginUser, logOutUser }
