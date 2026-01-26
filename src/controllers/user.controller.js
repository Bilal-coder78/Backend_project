import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const registerUser = asyncHandler(async (req, res) => {
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
    console.log("email :", email)

    // validation
    if ([username, email, fullname, password].some((field) =>
        field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    if(!email.includes("@")){
        throw new ApiError(400, "Invalid email format")
    }

    // check if user already exists
    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists with this email or username")
    }

    // check for avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
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
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating a user")
    }

    // return response 
    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser)
    )
})