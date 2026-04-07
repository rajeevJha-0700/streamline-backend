import { Router } from "express";
import {Feed} from "../controller/video.controller.js"
import { isUserAuthorised } from "../middleware/auth.middleware";

const router = Router();

router.route("/feed").get(isUserAuthorised,Feed);

export default router;