import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
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
    const { commentId } = req.params
    const userId = req.user._id
    


    if (!commentId) {
        throw new ApiError(400, "Invalid comment ID");
    }


    const existingLike = await Like.findOne({ comment: commentId, user: userId });

    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, "comment unliked successfully"));
    } else {

        const newLike = new Like({ comment: commentId, user: userId });
        await newLike.save();
        return res.status(200).json(new ApiResponse(200, "Comment liked successfully"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user._id


    if (!tweetId) {
        throw new ApiError(400, "Invalid tweet ID");
    }


    const existingLike = await Like.findOne({ tweet: tweetId, user: userId });

    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, "Comment unliked successfully"));
    } else {

        const newLike = new Like({ tweet: tweetId, user: userId });
        await newLike.save();
        return res.status(200).json(new ApiResponse(200, "Comment liked successfully"));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {

    const userId = req.user.id; // Assuming req.user is populated via authentication middleware

    // Fetch all likes for videos by the current user
    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
        .populate("video", "title description thumbnailUrl") // Populate specific video fields
        .exec();

    if (!likedVideos.length) {
        return res.status(404).json({ message: "No liked videos found." });
    }

    // Extract and return the populated video details
    const videos = likedVideos.map(like => like.video);
    res.status(200).json(videos);
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}