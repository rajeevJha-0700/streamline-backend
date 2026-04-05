import { connectDB } from "./db/DBconnection.js";
import { app } from "./app.js";
import dotenv from "dotenv";
const dot_env = dotenv.config();
if (dot_env.error) throw error;

(async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`server is listening on port ${process.env.PORT || 8000}`);
        });
    } catch (error) {
        console.log("DB connection failed...ERR ::",err)
    }
})();
