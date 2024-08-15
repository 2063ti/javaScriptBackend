import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!req.files) {
        throw  new ApiError(404,"video files does not exist.")
    }

    console.log("files:",req.files)
    const videoLocalPath =req.files?.videoFile[0]?.path;
    // const coverimageLocalPath= req.files?.coverimage[0]?.path;
   
    let thumbnailLocalPath
    if (req.files && Array.isArray(req.files.thumbnail)  && req.files.thumbnail.length>0) {
        thumbnailLocalPath=req.files.thumbnail[0].path
    }
    if (!videoLocalPath) {
       throw new ApiError(400,"video file is required.")
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400,"thumbnail file is required.")
    }

    const videoFile= await uploadOnCloudinary(videoLocalPath)
    const thumbnail= await uploadOnCloudinary(thumbnailLocalPath)


    if (!videoFile) {
        throw new ApiError(400,"Avatar file is required.")
    }
    if (!thumbnail) {
        throw new ApiError(400,"thumbnail file is required.")
    }
    if (!title) {
        throw new ApiError(400,"title is required.")
    }
    if (!description) {
        throw new ApiError(400,"description file is required.")
    }
    // || typeof duration === 'undefined' || duration === null
    console.log("hi",videoFile)
    const duration = videoFile.duration
    console.log(duration)
    if (!duration) {
        throw new ApiError(400,"duration file is required.")
    }
    // if (
    //     [fullname,email,username,password].some((field)=>field?.trim()=="")
    // ) {
    //     throw new ApiError(400,"All Fields are Required.")
    // }

    const newVideo = await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration,
        owner: req.user._id, // Assuming user ID is stored in req.user
    });

    // const video = await User.findOne({}).select(
    //     "-password -refreshToken"
    //    )
    
    //    if (!createdUser) {
    //     throw new ApiError(500,"Something Went wrong While registering User...")
    //    }
    
       return res.status(201).json(
        new ApiResponse(200,"Video is Uploaded Successfully...")
       )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log(videoId)
    //TODO: get video by id

    try {
        // Find the video by videoId
        const video = await Video.findById( videoId ).select('-videoFile -thumbnail'); // Exclude sensitive fields if needed

        if (!video) {
            throw  new ApiError(404,"video files does not find with this id.")
        }

        return res.status(200).json(200,video,"video fetched SuccessFully.")
        // res.status(200).json(video);
    } catch (error) {
        throw  new ApiError(500,'Error fetching video.',  error.message )
        
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);

    if (!video) {
        return res.status(404).json({ message: 'Video not found.' });
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(201).json(
        new ApiResponse(200,"Video published status is updated...")
       )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}