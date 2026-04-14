import { Router } from "express";
import {Feed, getVideo, uploadVideo} from "../controller/video.controller.js"
import { isUserAuthorised } from "../middleware/auth.middleware.js";
import { fileUploaderMiddleware } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/feed").get(Feed);
router.route("/upload-video").post(
  isUserAuthorised,
  fileUploaderMiddleware.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  uploadVideo
)

router.route("/v/:id").get(isUserAuthorised,getVideo)

export default router;