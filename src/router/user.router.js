import { Router } from "express";
import { registerUser,loginUser,logoutUser,accessTokenGenerationAfterExpiry } from "../controller/user.controller.js";
import { fileUploaderMiddleware } from "../middleware/multer.middleware.js";
import { isUserAuthorised } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/registration").post(fileUploaderMiddleware.single("avatar"),registerUser);
router.route("/login").post(loginUser);
router.route("/access-web").get(accessTokenGenerationAfterExpiry)
//secured routes
router.route("/logout").post(isUserAuthorised,logoutUser);


export default router