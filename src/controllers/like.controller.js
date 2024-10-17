import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id


    if (!videoId) {
        throw new ApiError(400, "Invalid video ID");
    }

 
    const existingLike = await Like.findOne({ video: videoId, user: userId });

    if (existingLike) {
       
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, "Video unliked successfully"));
    } else {
        
        const newLike = new Like({ video: videoId, user: userId });
        await newLike.save();
        return res.status(200).json(new ApiResponse(200, "Video liked successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}