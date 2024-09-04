import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name) {
        throw new ApiError(400, "Playlist name is required.");
    }

    if (!description) {
        throw new ApiError(400, "Playlist description is required.");
    }

    // Validate videos if provided
    if (videos && !Array.isArray(videos)) {
        throw new ApiError(400, "Videos must be an array of video IDs.");
    }

    // Create the playlist
    const playlist = new Playlist({
        name,
        description,
        // videos: videos || [],  // Initialize with an empty array if videos are not provided
        owner: req.user._id,   // Assuming req.user._id is available from authentication middleware
    });

    // Save the playlist to the database
    const savedPlaylist = await playlist.save();

    // Respond with the created playlist
    return res.status(201).json(
        new ApiResponse(201, "Playlist created successfully.", savedPlaylist)
    );
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
        throw new ApiError(400,"Playlist not found.")
    }

    await playlist.remove();

    return res.status(200).json(
        new ApiResponse(200, "Playlist deleted successfully.")
    );

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}