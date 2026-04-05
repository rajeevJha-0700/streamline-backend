import mongoose from mongoose



const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        min:1,
        max:500
    },
    videoId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    Commenter:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
},
{
    timestamps:true,
}
)



export const Comment = mongoose.model("Comment",commentSchema)