import jwt from "jsonwebtoken"
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";

const isUserAuthorised = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || null;
        if(!token) throw new apiError(400,"PASS REJECTED");

        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN);
        const user = await User.findById(decoded?._id);
        if(!user) throw new apiError(401,"Invalid Access Token");
        req.user = user; 
        next();
    } catch (error) {
        console.log("verification invalidate...",error);
        throw new apiError(500,"#validation error")
    }
});

export {isUserAuthorised}