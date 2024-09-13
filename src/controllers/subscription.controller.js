import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user.id;
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscription = await Subscription.findOne({subscriber:userId,channel:channelId});

    // console.log(subscription)
    if (subscription) {
        // If subscription exists, remove it (unsubscribe)
        await Subscription.deleteOne({ _id: subscription._id });
        res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"));
    } else {
        // If subscription does not exist, create it (subscribe)
        const newSubscription = new Subscription({ subscriber: userId, channel: channelId });
        await newSubscription.save();
        res.status(201).json(new ApiResponse(201, "Subscribed successfully"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    console.log(req.params);
    if (!channelId) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
    .populate('subscriber', '_id username email');

    console.log(subscribers.length)

    res.status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers  retrieved successfully"));

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    console.log("hey",req.params);
    if (!subscriberId) {
        throw new ApiError(400, "Invalid subscription ID");
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
    .populate('channel', '_id username email');
    res.status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels retrieved successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}