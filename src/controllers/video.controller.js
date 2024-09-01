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
    console.log("params",req.params);
    console.log("Body",req.body,req.query);
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // Build query object
    const queryObject = {};
    if (query) {
        queryObject.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
        ];
    }
    if (userId) {
        queryObject.userId = userId;
    }

    // Build sort object
    const sortObject = {};
    if (sortBy) {
        sortObject[sortBy] = sortType === 'desc' ? -1 : 1;
    }

    // Fetch videos
    const videos = await Video.find(queryObject)
        .sort(sortObject)
        .skip((pageInt - 1) * limitInt)
        .limit(limitInt);

    // Get total count
    const totalVideos = await Video.countDocuments(queryObject);

    return res.status(200).json(
        new ApiResponse(200, "Videos fetched successfully", {
            videos,
            pagination: {
                total: totalVideos,
                page: pageInt,
                limit: limitInt,
                totalPages: Math.ceil(totalVideos / limitInt)
            }
        })
    );
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
    const { title, description } = req.body;
    console.log(req.body,req.file.path)
    // const videoLocalPath  = req.files?.videoFile[0]?.path;
    // if (!videoLocalPath) {
    //     throw new ApiError(400,"videoFile is Missing.")
    // }

    // try {  } catch (error) {
    //     throw new ApiError(400,"Something went wrong.")
    // }
        let thumbnailLocalPath
        // if (req.file && Array.isArray(req.file)  && req.file.length>0) {
        //     thumbnailLocalPath=req.file?.path
        // }
        thumbnailLocalPath  = req.file.path
        // if (!videoLocalPath) {
        //    throw new ApiError(400,"video file is required.")
        // }
        console.log(thumbnailLocalPath)
        if (!thumbnailLocalPath) {
            throw new ApiError(400,"thumbnail file is required1.")
        }
    
    
        // const videoFile = await uploadOnCloudinary(videoLocalPath )
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
        
        // if (!videoFile) {
        //     throw new ApiError(400,"Avatar file is required.")
        // }
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
        // console.log("hi",videoFile)
        // const duration = videoFile.duration
        // console.log(duration)
        // if (!duration) {
        //     throw new ApiError(400,"duration file is required.")
        // }
    
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                title,
                description,
                thumbnail: thumbnail.url,
            },
            { new: true }
        );
    
        if (!updatedVideo) {
            throw new ApiError(404, "Video not found.");
        }
    
    
    
        return res.
        status(200)
        .json(
            new  ApiResponse(200,updateVideo,"videoFile  is updated SuccessFully.")
        )
    
  
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found.");
    }

    // Delete the video
    await video.remove();

    return res.status(200).json(
        new ApiResponse(200, "Video deleted successfully.")
    );
    
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