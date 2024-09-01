import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAcessAndRefreshTokens =async(userId)=>
    {
    try {
        const user = await User.findById(userId) 
        const accessToken =user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something Went wrong while generating refresh and Acess token.")
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })
    //1>  get user details from frontend.
    //2>  validation - not empty.
    //3>  Check if user already exist : userName,email.
    //4>  check for images , check for avtar.
    //5>  upload them to cloudinary.
    //6>  create user object - create entry in db.
    //7> remove password and refresh token field from response.
    //8> Check for user creation.
    //9> return res. 

    const {fullname,email,username,password}=req.body
    console.log("email :",email);
    console.log("Body :",req.body);
    console.log("req :",req);
    // if (fullname==""){
    //     throw new ApiError(400,"FullName is Required :")

    // }

    if (
        [fullname,email,username,password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400,"All Fields are Required.")
    }
   const existedUser= await User.findOne({
        $or:[{ username } , { email }]
    })
    console.log("existedUser:",req.existedUser)
    if (existedUser) {
        new ApiError(409,"user with email or username exists :")
    }
    console.log("files:",req.files)
    const avatarLocalPath =req.files?.avatar[0]?.path;
    // const coverimageLocalPath= req.files?.coverimage[0]?.path;
   
    let coverimageLocalPath
    if (req.files && Array.isArray(req.files.coverimage)  && req.files.coverimage.length>0) {
        coverimageLocalPath=req.files.coverimage[0].path
    }
    if (!avatarLocalPath) {
        new ApiError(400,"Avatar file is required.")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverimage= await uploadOnCloudinary(coverimageLocalPath)


    if (!avatar) {
        new ApiError(400,"Avatar file is required.")
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username:username.toLowerCase()

    })
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if (!createdUser) {
    throw new ApiError(500,"Something Went wrong While registering User...")
   }

   return res.status(201).json(
    new ApiResponse(200,"user registered Successfully...")
   )
})

const loginUser =asyncHandler(async(req,res)=>{
    // req body -> data 
    // username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie
    console.log("params",req.params);
    console.log("Body",req.body,req.query);
    const {email,username,password}=req.body
    console.log("hi:",email,username,password)
    if (!(username || email)) {
        throw new ApiError(400,"Username or password is required.")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if (!user) {
       throw  new ApiError(404,"User does not exist.")
    }

    console.log("hi:",password)
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
       throw new ApiError(401,"Invalid User Credentials.")
    }

    const {accessToken,refreshToken} = await generateAcessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")


    if (!loggedInUser) {
        throw new ApiError(401,"Invalid loggedInUser.")
     }
    const options = {
        httpOnly : true,
        secure:true
    }

    return res.status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,
                refreshToken
            },
            "user Logged in SuccessFully."
        )
    )


})


const logoutUser = asyncHandler(async(req,res)=>{

    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }
        },{
            new :true
        }

    )

    const options = {
        httpOnly : true,
        secure:true
    }

    return res.status(200).
    clearCookie("accessToken",options).
    clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User logged Out."))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
   const incomingRefreshToken= req.cookies.refreshToken||req.body.refreshToken

   if (!incomingRefreshToken) {
        throw new ApiError(401,"unauthorized Request.")
   }

   try {
    const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
    )
 
    const user = User.findById(decodedToken?._id)
 
    if (!user) {
     throw new ApiError(401,"Invalid Refresh Token.")
 }
 
     if (incomingRefreshToken !== user?.refreshToken) {
         
         throw new ApiError(401,"Refresh Token is Expired or Used.")
     }
 
     const options = {
         httpOnly:true,
         secure:true
     }
 
     const {accessToken,newrefreshToken}=await generateAcessAndRefreshTokens(user._id)
 
     return res.status(200).cookie("Access Token",accessToken,options).cookie("Refresh Token",newrefreshToken,options).json(
         new ApiResponse(
             200,
             {accessToken,refreshToken:newrefreshToken}
             ,"Access Token Refreshed SuccessFully."
         )
     )
   } catch (error) {
        throw new ApiError(401,error?.message||"Invalid refresh Token.")
   }


})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPasswordd,newPassword}= req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPasswordd)

    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid old Password.")

    }

    user.password= newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password Changed SuccessFully."))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(200,req.user,"Current user fetched SuccessFully.")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body

    if (!fullname || !email) {
        throw new ApiError(400,"All Fields Are Required.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {new:true}
    ).select("-password ")


    return res.status(200).
    json(new ApiResponse(200,user,"Account Details Updated SuccessFully."))

})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar File is Missing.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400,"Error While Uploading Avatar.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
                $set:avatar.url
        },
        {new:true}
    ).select("-password")


    return res.
    status(200)
    .json(
        new  ApiResponse(200,user,"avatar image  is updated SuccessFully.")
    )

})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400,"Cover Image  File is Missing.")
    }

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400,"Error While Uploading CoverImage.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
                $set:coverImage.url
        },
        {new:true}
    ).select("-password")

    return res.
    status(200)
    .json(
        new  ApiResponse(200,user,"cover image  is updated SuccessFully.")
    )

})



const getUserChannelProfile= asyncHandler(async(req,res)=>{

    const {username}=req.params

    if (!username?.trim()) {
        throw new ApiError(400,"username is missing.")
    }

    const channel = await User.aggregate([
        {
            $match: {username:username?.toLowerCase()}
        }
        ,{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },{
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})



const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


export  { 
        registerUser ,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory
}