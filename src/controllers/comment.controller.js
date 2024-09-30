import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query


    try {
        // Parse page and limit values into integers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch comments for the video with pagination
        const comments = await Comment.find({ video: videoId })
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 });// Sort by newest comments first

        // Get the total count of comments for the video
        const totalComments = await Comment.countDocuments({ video: videoId });


        console.log(comments)
        // Send the response with the comments and pagination info
        res.status(200).json({
            success: true,
            data: comments,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalComments / limitNumber),
                totalComments,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch comments', error: error.message });
    }


    // Build an aggregation pipeline
    const aggregate = Comment.aggregate([
        { $match: { videoId: videoId } }, // Match comments for the video
        { $sort: { createdAt: -1 } }, // Sort by createdAt, descending (newest first)
    ]);


    // // Use aggregatePaginate to paginate the aggregation results
    // const options = {
    //     page,
    //     limit,
    // };

    // try {
    //     const paginatedComments = await Comment.aggregatePaginate(aggregate, options);
    //     console.log(paginatedComments)
    //     res.status(200).json({
    //         success: true,
    //         data: paginatedComments.docs, // Comments data
    //         currentPage: paginatedComments.page, // Current page number
    //         totalPages: paginatedComments.totalPages, // Total number of pages
    //         totalComments: paginatedComments.totalDocs, // Total number of comments
    //     });
    // } catch (error) {
    //     res.status(500);
    //     throw new Error('Server Error');
    // }


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body;
    const userId = req.user._id;
    const { videoId } = req.params;
    console.log(content, videoId)


    if (!content || !videoId) {
        return res.status(400).json({ message: 'Content and videoId are required' });
    }


    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json({ message: 'Video not found' });
    }


    const comment = new Comment({
        content,
        video: videoId,
        owner: userId
    });


    const savedComment = await comment.save();




    return res.status(201).json(
        new ApiResponse(200, "comment is added Successfully...")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(404, "please pass the comment it is required.");
    }
    if (!commentId) {
        throw new ApiError(404, "please pass the commentID it is required.");
    }

    try {

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content }, 
            { new: true, runValidators: true } 
        );

        if (!updatedComment) {
            return new ApiError(404, "comment not found.");
        }

        return res.status(200)
            .json(
                new ApiResponse(200,updatedComment , "Comment is updated successfully")
            );
    } catch (error) {
        
        throw new ApiError(404, "Server Error.");

    }

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(404, "please pass the commentID it is required.");
    }

    try {
        console.log(commentId)

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ success: false, message: "Invalid comment ID." });
        }

        const deleteComment = await Comment.findByIdAndDelete();

        console.log(deleteComment)

        return res.status(200).json(
            new ApiResponse(200, "Comment deleted successfully.")
        );
        
    } catch (error) {
        throw new ApiError(404, "Server Error.");

        // if (error instanceof ApiError) {
        //     return res.status(error.statusCode).json(
        //         new ApiResponse(error.statusCode, error.message)
        //     );
        // }

        // // Handle any unexpected server errors
        // return res.status(500).json(
        //     new ApiResponse(500, "Server Error.")
        // );
    }

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}