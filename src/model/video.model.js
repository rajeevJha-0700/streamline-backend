import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String, //3rd party url where video is uploaded
        required: true,
    },

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
    thumbnail:{
        type: String, //3rd party url 
        required: true
    },

    title:{
        type: String,
        required: true
    },

    duration:{
        type: Number,
    },

    views:{
        type: Number,
        default: 0
    },

    likes:{
        type: Number,
        default: 0
    },

    isPublished:{
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema);