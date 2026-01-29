import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // save tokens in db
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, error.message || "Error generating tokens")
    }

}

const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here

    // get user details from frontend
    // validation - not empty
    // check if user already exists : email,username
    // check for images check for avatar
    // upload them to cloudinary,avatar
    // create user object  - create entry in db
    // remove password and refresh token from response
    // check for user creation
    // return response

    const { username, email, fullname, password } = req.body;
    // console.log("email :", email)

    // validation
    if ([username, email, fullname, password].some((field) =>
        field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    if (!email.includes("@")) {
        throw new ApiError(400, "Invalid email format")
    }

    // check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists with this email or username")
    }
    // console.log(req.files)
    // check for avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    // upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }

    // create user object
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase().trim(),
        email,
        password
    })

    // remove password and refresh token
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating a user")
    }

    // return response 
    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser)
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // req body - data
    // email or username
    // find the user
    // password check
    // generate access and refresh token
    // send cookies

    const { username, email, password } = req.body;
    console.log(email)

    if (!email && !username) {
        throw new ApiError(400, "Email or username is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // send cookies

    // method for security changes can only be set in server not in frontend
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: null,
            }
        },
        {
            new: true,
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access token refreshed successfully",
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };