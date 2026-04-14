import { asyncHandler } from "../utils/asyncHandler.js";
import {Video} from "../model/video.model.js"
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { mediaUpload } from "../utils/cloudinary.js";
import mongoose from "mongoose";
 
const Feed = asyncHandler(async(req,res)=>{
  const videos =  await Video.aggregate([
    {
        $lookup:{
            from:"users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline:[
                {
                    $project:{
                        username:1,
                        fullname:1,
                        avatar:1
                    }
                }
            ]
        }

    },
    {
        $sort:{
            views: -1,
            createdAt: -1
        }
    }
  ]);

  res.status(200).json(new apiResponse(200,videos,"feed sent successfully"))
});

const uploadVideo = asyncHandler(async(req,res)=>{
    try {
        console.log("user is requesting to upload a video file")
        const videoPath = req.files?.video[0]?.path;
        const thumbnail = req.files?.thumbnail[0]?.path;
        const {title,duration} = req.body;
        if(!videoPath) throw new apiError(500,"no videoPath available");
        if(!thumbnail) throw new apiError(500,"no thumbnail available");
        let videoUrl = undefined, thumbnailUrl = undefined;
        try {
            const result = await Promise.all([mediaUpload(videoPath),mediaUpload(thumbnail)]);
              videoUrl = result[0];
              thumbnailUrl = result[1];
        } catch (error) {
            console.log("cannot upload media files...",error);
            throw new apiError(500,error.message);
        }
        
        const video = await Video.create({
            videoFile: videoUrl,
            owner: req.user._id,
            thumbnail:thumbnailUrl,
            title,
            duration
        });

        res.status(201).json(new apiResponse(201,video,"video uploaded successfully"))
    } catch (error) {
        console.log("video cannot be uploaded at this moment ...",error);
        throw new apiError(500,error.message);
    }
})

const deleteVideo = asyncHandler(async(req,res)=>{
   const videoId = req.params?._id ;
   if(!videoId) throw new apiError(400,"no video id");
   await Video.deleteOne(videoId);
   res.status(200).json(new apiResponse(200,{},"video Deleted successfully"))
})

const getVideo = asyncHandler(async(req,res)=>{
    const {id} = req.params
    if(!id) throw new apiError(400,"Bad request");
    const video = await Video.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline:[
                    {
                        //i am at user's document
                       $lookup:{
                        from: "subscriptions",
                        localField: "_id",
                        foreignField: "channel",
                        as: "subscribersList",
                       }
                    },
                    {
                        $addFields:{
                           subsCount:{$size:"$subscribersList"}
                        }
                    },
                    {
                        $project:{
                            username:1,
                            avatar:1,
                            subsCount:1
                        }
                    }
                ]
            }
        },
    ])
    if(!video) throw new apiError("404","no video found");
    res.status(200).json(new apiResponse(200,video,"video fetched successfully..."));
})

export {
    Feed,
    uploadVideo,
    deleteVideo,
    getVideo
}