import { asyncHandler } from '../utils/asyncHandler.js';


export const registerUser = asyncHandler( async (req,res) => {
    // Registration logic here
    res.status(200).json({
        message: "Bilal is the user",
    })
})