import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

const mediaUpload = async function(localFilePath){ //localFilePath shall be provided in req obj added by multer, therefore it is important that multer handles the file first,and that's why muter is a middleware
  try {
       //cloudinary configuration 
       cloudinary.config({
         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
         api_key: process.env.CLOUDINARY_API_KEY,
         api_secret: process.env.CLOUDINARY_API_SECRET,
         secure: true
       });
        if(!localFilePath) return null;
        const result = await cloudinary.uploader.upload(localFilePath,{
         resource_type: "auto"
        });
        console.log("file uploaded sucessfully");
        fs.unlinkSync(localFilePath);
        console.log("unlinked the file successfully")
        return result.secure_url;
    } catch (error) {
      fs.unlinkSync(localFilePath); //remove temporarily stored media from my disc
      console.log("file deleted automatically from server as fileError occured....");
      console.log("cloudinary error : ",error);
        return null
    }
}

//result : 
/*
{
  "asset_id": "bf98540caf22ed65775ee0951f4746c9",
  "public_id": "cld-sample",
  "format": "jpg",
  "version": 1719304891,
  "resource_type": "image",
  "type": "upload",
  "created_at": "2024-06-25T08:41:31Z",
  "bytes": 476846,
  "width": 1870,
  "height": 1250,
  "backup": true,
  "asset_folder": "",
  "display_name": "cld-sample",
  "url": "http://res.cloudinary.com/cld-docs/image/upload/v1719304891/cld-sample.jpg",
  "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/v1719304891/cld-sample.jpg",
  "next_cursor": "497b323dcb9883a15a5e6a7cfb75d439e4de1ca882f5cbe8de6a8b322c37bdad",
  "derived": [
    {
      "transformation": "c_scale,w_500",
      "format": "jpg",
      "bytes": 22871,
      "id": "ce3d7bf3068809656dc5aa76572535da",
      "url": "http://res.cloudinary.com/cld-docs/image/upload/c_scale,w_500/v1719304891/cld-sample.jpg",
      "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/c_scale,w_500/v1719304891/cld-sample.jpg"
    }
  ]
}
*/

export {mediaUpload}