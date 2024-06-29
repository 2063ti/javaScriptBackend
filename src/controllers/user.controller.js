import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    // if (fullname==""){
    //     throw new ApiError(400,"FullName is Required :")

    // }

    if (
        [fullname,email,username,password].some((field)=>field?.trim()=="")
    ) {
        throw new ApiError(400,"All Fields are Required.")
    }
   const existedUser= User.findOne({
        $or:[{ username } , { email }]
    })
    console.log("existedUser:",req.existedUser)
    if (existedUser) {
        new ApiError(409,"user with email or username exists :")
    }
    console.log("files:",req.files)
    const avatarLocalPath =req.files?.avatar[0]?.path;
    const coverimageLocalPath= req.files?.coverimage[0]?.path;

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

export  { registerUser }