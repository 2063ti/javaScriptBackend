import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    console.log("name :",name,description,req.body)

    if (!name) {
        throw new ApiError(400, "Playlist name is required.");
    }

    if (!description) {
        throw new ApiError(400, "Playlist description is required.");
    }

    // // Validate videos if provided  66be005df57eb981a84ecc80
    // if (videos && !Array.isArray(videos)) {
    //     throw new ApiError(400, "Videos must be an array of video IDs.");
    // }

    // Create the playlist
    const playlist = new Playlist({
        name,
        description,
        //videos: videos || [],  // Initialize with an empty array if videos are not provided
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
    console.log(userId)
    if (!userId) {
        throw new ApiError(404, "Playlist not found");
    }

    const userPlaylists  =   await Playlist.find({owner:userId}).exec()// owner:

    if (!userPlaylists || userPlaylists.length === 0) {
        throw new ApiError(404, "No playlists found for this user");
    }
   

    res.status(200)
    .json(new ApiResponse(200, "User playlists retrieved successfully", userPlaylists));

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    // console.log(playlistId)
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'Invalid playlist ID');
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    res.status(200).json(new ApiResponse(playlist));

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!playlistId) {
        throw new ApiError(400, "PlaylistId  is required.");
    }
    if (!videoId) {
        throw new ApiError(400, "videoId  is required.");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save();
    }

    res.status(200)
    .json(new ApiResponse(200, "Video added to playlist successfully", playlist));


})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!playlistId) {
        throw new ApiError(400, "PlaylistId  is required.");
    }
    if (!videoId) {
        throw new ApiError(400, "videoId  is required.");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    const videoIndex =  playlist.videos.indexOf(videoId);
    if(videoIndex===-1)
    {
        throw new ApiError(404, "Video not found in playlist");
    }

    playlist.videos.splice(videoIndex, 1);
    await playlist.save();

    res.status(200)
    .json(new ApiResponse(200, "Video removed from playlist successfully", playlist));

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
  

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'Invalid playlist ID');
    }

    if (!name) {
        throw new ApiError(400, "Playlist name is required.");
    }

    if (!description) {
        throw new ApiError(400, "Playlist description is required.");
    }

    // Find and update the playlist
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true, runValidators: true }
    );

    // If playlist not found
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    // Send response
    res.status(200).json(new ApiResponse(200, 'Playlist updated successfully', playlist));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}