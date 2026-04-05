import {asyncHandler} from "./../utils/asyncHandler.js";
import { User } from "../model/user.model.js";
import { apiError } from "../utils/apiError.js";
import { mediaUpload } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req,res)=>{
    //destructuring request
  const {username,email,fullname,password} = req.body; 
  if(
     [username,email,fullname,password].some((field)=>(field?.trim() === ""))//.some() loops on every element and checks whether any of the element satisfies the condition , if so , returns true
    ){
        throw new apiError(400,"all fields are required");
    };

    //does already user exist ??
    const alreadyUserExist = await User.findOne(
        {
            $or:[{email},{username}]
        }
    );
    if(alreadyUserExist) return apiError(409,"user already exist with provided values");
    
    //uploading avatar
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath) throw new apiError(500,"avatar local path is required");
    const avatarInstance = await mediaUpload(avatarLocalPath);
    if(!avatarInstance) throw new apiError(500,"cannot create avatarInstance at the moment")
    
    //user creation
    const user = await User.create({
        username,
        email,
        fullname,
        avatar:avatarInstance,
        password
    });
   if(user && user._id){
     const userObj = user.toObject();
     delete userObj.password;     //|  (method 1)avoid sending these field as response
     delete userObj.refreshToken; //|  
    //const createdUser = await user.findById({user._id}).select("-password -refreshToken") | (method 2) to avoid sending any particular field in response
    res.status(201).json(new apiResponse(200,userObj,"user created successfully") )
   }
})

//generating access and refresh token function
const generateAccessAndRefreshToken = (user)=>{
  try {
     const refreshToken = user.generateRefreshToken();
     const accessToken = user.generateAccessToken();
     return {refreshToken,accessToken}
  } catch (error) {
      console.log("tokenErr: ",error)
     throw new apiError("500","something went wrong while generating tokens");
  }
}

const loginUser = asyncHandler(async(req,res)=>{
    const {username,password} = req.body;
    const user = await User.findOne({username: username?.toLowerCase()}).select("+password");
    if(!user) throw new apiError(404,"user not found");

    //validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) throw new apiError("404","invalid credentials");

    //generating tokens
    const {refreshToken,accessToken} = generateAccessAndRefreshToken(user);
    user.refreshToken = refreshToken;
    const loggedInUser = await user.save({validateBeforeSave:false});
    let loggedInUserObject = {};
    if((loggedInUser && loggedInUser._id) && (loggedInUser.password || loggedInUser.refreshToken)){
       loggedInUserObject = loggedInUser.toObject();
       delete loggedInUserObject.password
       delete loggedInUserObject.refreshToken
    }else loggedInUserObject = loggedInUser.toObject();

    //sending response
    const options = {
        httpOnly: true, //can be manipulated by server only
        secure:true,
    }
    res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new apiResponse(200,{data: loggedInUserObject},"userLoggedIn successfully"))
})

const logoutUser = asyncHandler(async(req,res)=>{
   const user = req.user;
   await User.findByIdAndUpdate(user._id,{
    // $set:{
    //     refreshToken : null
    // },
    $unset:{
        refreshToken:1
    }
   },{new: true});
  
   const options = {
    httpOnly: true,
    secure: true
   };

   res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new apiResponse(200,{},"user logged out successfully"))
})

const accessTokenGenerationAfterExpiry = asyncHandler(async(req,res)=>{
   try {
    const RefreshToken = req.cookies?.refreshToken;
   if(!RefreshToken) throw new apiError(400,"unauthorised user, redirect him to login/register");

   const decoded = jwt.verify(RefreshToken,process.env.REFRESH_TOKEN);
   if(!decoded) throw new apiError(401,"Ref token not matched");
   
   const user = await User.findById(decoded?._id).select("-password -refreshToken");
   if(!user) throw new apiError(401,"invalid access token")

   const accessToken = user.generateAccessToken();
   
   res.status(200)
   .cookie("accessToken",accessToken)
   .cookie("refreshToken",RefreshToken)
   .json(new apiResponse(200,{accessToken},"accessToken transferred successfully"))
   } catch (error) {
    console.log("cannot generate access token###",error);
    throw new apiError(500,"cannot generate access token###")
   }
})

const channelFunction = asyncHandler(async(req,res)=>{
    try {
        const clickedChannel = req.params?.username;//some user might have clicked then i need the name of the channel
        const channelDetails = await User.aggregate(
        [
            {
                $match:{
                    username: clickedChannel
                }
            },
            {
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscriberArray" 
                }
            },
            {
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedToArray" 
                }
            },
            {
                $addFields:{
                    subsCount:{$size:"$subscriberArray"},
                    subscribedToCount:{$size:"$subscribedToArray"},
                    isSubscribed:{
                        $cond:{
                            if:{$in:[req.user?._id,"$subscriberArray"]},
                            then:true,
                            else:false
                        }
                    }
                }
            },
            {
                
                $project:{
                    username:1,
                    fullname:1,
                    subsCount:1,
                    subscribedToCount:1,
                    isSubscribed:1
                }
                
            }
        ] 
    );

    if(!channelDetails)throw new apiError(400,"no such channel exist");

    return res.status(200)
    .json(new apiResponse(200,{channelDetails},"channelDetails sent successfully")) 

    } catch (error) {
        console.log("some error occurred while fetching channel details...",error);
        throw new apiError(400,error.message);
    }
})

const userWatchHistory = asyncHandler(async(req,res)=>{
    //const user = req.user._id //but this can't be used as aggregation pipelines use the actual userObject but mongoose will make it string implicitely
    await User.aggregate([
        {
            $match:{
                _id: req.user._id
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        },
                    },
                ]
            }
        }
    ])
})

const getCurrentUser = asyncHandler(async(req,res)=>{
   res.status(200)
   .json(new apiResponse(200,req.user,"user details sent"))
})

export {
registerUser,
loginUser,
logoutUser,
accessTokenGenerationAfterExpiry,
channelFunction,
userWatchHistory,
getCurrentUser
}