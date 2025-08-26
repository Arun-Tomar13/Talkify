import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../lib/apiError.js";

export const protectRoute = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        
        if(!token){
            throw new ApiError(401,"Not authorized, no token");
        }

    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);

    if(!decoded){
        throw new ApiError(401,"Not authorized, token failed");
    }

    const user = await User.findById(decoded.userId).select("-password");

    if(!user){
        throw new ApiError(401," Unauthorized, user not found");
    }

    req.user = user;
    next();

    } catch (error) {
        console.log("Error in protectRoute at auth middleware",error);
        res.status(401).json({message:"Not authorized, token failed"});
    }
}