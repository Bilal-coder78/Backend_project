import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';

export const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here
    
    // get user details from fronted
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
    const existedUser = User.findOne({
        $or: [{email}, {username}]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists with this email or username")
    }
})