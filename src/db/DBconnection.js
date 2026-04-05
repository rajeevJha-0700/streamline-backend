import mongoose from "mongoose";
//import { ASSIGNED_DB } from "../constants.js";

export const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}`);

        console.log("db connection instance HOST: ",connectionInstance.connection.host);
    } catch (error) {
        console.error("DB CONNECTION ERR <-->",error);
    }
}