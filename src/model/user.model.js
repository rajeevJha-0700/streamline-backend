import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    username:{
       type:String,
       required: [true,"username is required"],
       unique:[true,"username should be unique"],
       trim:true,
       lowercase:true
    },

    email:{
       type:String,
       required: [true,"username is required"],
       unique:[true,"username should be unique"],
       trim:true,
       lowercase:true
    },

    fullname:{
       type:String,
       required: [true,"username is required"],
       unique:[true,"username should be unique"],
       trim:true,
       lowercase:true
    },
    
    avatar:{
     type:String,
     required: true,
    },

    watchHistory:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],

    subscribedChannelList:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Subscription"
        }
    ],

    password:{
        type: String,
        select: false,
    },

    refreshToken:{
        type: String,
        select: false
    }

},
{
    timestamps: true
});

userSchema.pre("save", async function(){
   try {
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password,10);
    } catch (error) {
     console.log("user_modelerror: ",error)
     throw error;
   }
})

//custom method to check password
userSchema.methods.isPasswordCorrect = async function(password){ //this method is now accessible by every document made on userSchema
   try {
     return await bcrypt.compare(password,this.password);
   } catch (error) {
    console.log("error while password differentiation:: ",error)
   }
};

//custom method to generate Refresh Tokens 
userSchema.methods.generateRefreshToken = function(){
    try {
        return jwt.sign({
            _id: this._id,
        },process.env.REFRESH_TOKEN,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY});
    } catch (error) {
     console.log("error while generating ref token $##",error)   
    }
};

//custom method to generate access tokens 
userSchema.methods.generateAccessToken = function(){
    try {
        return jwt.sign({
            _id: this._id,
            username: this.username,
            email:this.email,
        },process.env.ACCESS_TOKEN,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
    } catch (error) {
        console.log("error while generating token...",error)
    }
}
export const User = mongoose.model("User",userSchema);