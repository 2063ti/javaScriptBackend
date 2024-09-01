import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/upload-video")    .post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
        
    ]),
    publishAVideo
);
router.route('/get-video/:videoId').get(getVideoById) 
router.route("/getAll-videos").get(getAllVideos)
router.route("/delete-video/:videoId").delete(deleteVideo)
router.route("/update-video/:videoId").patch(upload.single("thumbnail"), updateVideo);
export default router
// router
//     .route("/")
// router.route("getAll-videos").get(getAllVideos)


// router
//     .route("/:videoId")
//     .get(getVideoById)
//     .delete(deleteVideo)
//     .patch(upload.single("thumbnail"), updateVideo);

// router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

