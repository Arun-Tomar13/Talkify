import ApiError from "../lib/apiError.js";
import { upsertUser } from "../lib/stream.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const signup =  async (req,res)=>{
    try {
        const {email,fullName,password} = req.body;
    
        if(!email || !fullName || !password){
            throw new ApiError(400,"All fields are required");
        }
    
        if(password.length < 6){
            throw new ApiError(400,"Password must be at least 6 characters long");
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if (!emailRegex.test(email)) {
            throw new ApiError(400,"inavlid email format");
        }
    
        const existingUser = await User.findOne({email});
    
        if(existingUser){
            throw new ApiError(400,"Email already exists");
        }
    
        const idx = Math.floor(Math.random() * 100) +1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    
        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic:randomAvatar,
        })
    
        try {
            await upsertUser({
                id:newUser._id.toString(),
                name:newUser.fullName,
                image:newUser.profilePic || "",
            })
            console.log(`stream user created for ${newUser.fullName}`);
            
        } catch (error) {
            console.log("Error in creating stream user",error);
        }

        const token = jwt.sign({userId:newUser._id},process.env.JWT_SECRET_KEY,{expiresIn:"7d"})
    
        const options={
            maxAge: 7*24*60*60*1000,
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV === "production"
        }
    
        res
        .status(200)
        .cookie("jwt",token,options)
        .json({
            success:true,
            message:"User created successfully",
            user:newUser
        })
    } catch (error) {
        console.log("Error in signup controller",error);
        res.status(500).json({
            message:error.message || "Internal server error"
        })
    }
}

const login = async (req,res)=>{
    try {
        const {email,password} = req.body;
    
        if(!email || !password){
            throw new ApiError(400,"All fields are required");
        }
    
        const user = await User.findOne({email});
    
        if(!user){
            throw new ApiError(401,"Invalid email and password");
        }
    
        const isPasswordCorrect = await user.matchPassword(password);
    
        if(!isPasswordCorrect){
            throw new ApiError(401,"Invalid email and password");
        }
    
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"7d"})
        
            const options={
                maxAge: 7*24*60*60*1000,
                httpOnly:true,
                sameSite:"strict",
                secure:process.env.NODE_ENV === "production"
            }
    
        res
        .status(200)
        .cookie("jwt",token,options)
        .json({succes:true,user,message: "userloggedin successfully"});
    }  catch (error) {
  console.error("Error in sendFriendRequest controller", error);
  return res
    .status(error.statusCode || 500)
    .json({ message: error.message || "Internal server error" });
}}

const logout =  async (req,res)=>{
    res
    .clearCookie("jwt")
    .json({success:true,message:"user logged out successfully"});

}

const onboard = async (req,res)=>{
    try {
        const userId =req.user._id;
    
        const {fullName,bio,nativeLang,learningLang,location} = req.body;
    
        if(!fullName || !bio || !nativeLang || !learningLang || !location){
            return res.status(400).json({
                   message:"All fields are required",
                   missingFields:[
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLang && "nativeLang",
                    !learningLang && "learningLang",
                    !location && "location"
                   ].filter(Boolean)
        });
        }
    
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...req.body,
                isOnborded:true
            },
            {new:true}
        );
    
        if(!updatedUser){
            throw new ApiError(404,"user not found");
        }

        try {
            await upsertUser({
                id:updatedUser._id.toString(),
                name:updatedUser.fullName,
                image:updatedUser.profilePic || "",
            })
            console.log(`stream user updated for ${updatedUser.fullName}`);
            
        } catch (streamerror) {
            console.log("Error in updating stream user",streamerror);
        }
    
        res.status(200).json({success:true,user:updatedUser,message:"User onboarded successfully"});

    } catch (error) {
        console.error("Error in onboard controller",error);
        res.status(500).json({message:"Internal server error"});
    }
}

export {
    signup,
    login,
    logout,
    onboard
};