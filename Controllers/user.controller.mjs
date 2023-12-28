import { userDB } from "../Models/user.model.mjs"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import env from "dotenv"
import mongoose from "mongoose"
import {v4 as uuidv4} from "uuid"
import { cloudinaryUpload } from "../Utils/Cloudinary.mjs"
import { createError, internalServerError } from "../Utils/Errors.mjs"
import { sendVerificationLink } from "../Utils/Email.mjs"

env.config()

const userLogin = async (req, res) => {
    try {
        const { username, password } = req.query
        
        const user = await userDB.findOne(
            {
                username: username
            }
        )
        if (!user) {
            createError(res, 404, "User does not exist")
        } else {
            const checkPassword = await bcrypt.compare(password, user.password)
            if (!checkPassword) {
                createError(res, 403, "Invalid credentials")
            } else {
                if (!user.valid_user) {
                    createError(res, 404, "Email verification is pending!")
                } else {
                    user.password = ""
                    const token = jwt.sign({ sub: user._id }, process.env.JWT_KEY, { expiresIn: "7d" })
                    res.status(201).json(
                        {
                            message: "User data fetched",
                            token: token,
                            user: user
                        }
                    )
                }
            }
        }
    } catch (err) {
        internalServerError(res)
    }
}

const signupUser = async (req, res) => {
    try {
        const { confirm_password, ...userData } = req.body
        const findUser = await userDB.findOne(
            {
                username: userData.username
            }
        )
        if (findUser) {
            createError(res, 409, "Username already exist")
        } else {
            const findUser = await userDB.findOne(
                {
                    email: userData.email
                }
            )
            if (findUser) {
                createError(res, 409, "Email already exist")
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                const founder = await userDB.find({ founder: true })
                if (founder) {
                    userData.following = founder.map(item => item._id)
                } else {
                    userData.founder = true
                    userData.verified = true
                }
                const response = await userDB.create(userData)
                if (founder.length>0) {
                    await userDB.updateOne({founder: true},{$push:{followers:response._id}})
                }
                const mailResponse = await sendVerificationLink(response.email, response._id)
                if (!mailResponse) {
                    return createError(res, 503, "Mailing failed. Contact @thenamevishnu")
                }
                res.status(200).json(
                    {
                        message: "Verification mail sent to " + response.email,
                        result: "success"
                    }
                )
            }
        }
    } catch (err) {
        console.log(err);
        internalServerError(res)
    }
}

const validUser = async (req, res) => {
    try {
        const { id } = req.params
        const response = await userDB.findOne(
            {
                _id: id
            }
        )
        if (!response) {
            createError(res, 404, "user not found!")
        } else {
            if (!response.valid_user) {
                const resData = await userDB.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { valid_user: true } })
                if (resData?.modifiedCount > 0) {
                    res.status(200).json({message: "You're now a valid user", result: true})
                } else {
                    createError(res, 404, "user not found!")
                }
            } else {
                createError(res, 409, "Already verified")
            }
        }
    } catch (err) {
        createError(res, 404, "Not found!")
    }
}

const getUsers = async (req, res) => {
    try {
        const { prefix } = req.query
        let obj;
        if (!prefix) {
            obj = {}
        } else {
            obj = {
                $or: [{username: { $regex: prefix, $options: "i"}},{name: { $regex: prefix, $options: "i"}}]
            }
        }
        const response = await userDB.find(obj)
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const getMe = async (req, res) => {
    try {
        const { id } = req.params
        const result = await userDB.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "_id",
                        foreignField: "posted_by",
                        as: "posts"
                    }
                }
            ]
        )
        if (result.length === 0) {
            return createError(res, 404, "User not found!")
        }
        res.status(200).json({result: result[0]})
    } catch (err) {
        internalServerError(res)
    }
}

const getFollowers = async (req, res) => {
    try {
        const { user_id } = req.params
        const response = await userDB.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(user_id)
                    }
                }, {
                    $lookup: {
                        from: "users",
                        localField: "followers",
                        foreignField: "_id",
                        as: "followersData"
                    }
                }
            ]
        )
        res.status(200).json({result: response[0].followersData})
    } catch (err) {
        internalServerError(res)
    }
}

const getFollowings = async (req, res) => {
    try {
        const { user_id } = req.params
        const response = await userDB.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(user_id)
                    }
                }, {
                    $lookup: {
                        from: "users",
                        localField: "following",
                        foreignField: "_id",
                        as: "followingsData"
                    }
                }
            ]
        )
        res.status(200).json({result: response[0].followingsData})
    } catch (err) {
        internalServerError(res)
    }
}

const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.query
        const result = await userDB.aggregate(
            [
                {
                    $match: {
                        username: username
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "_id",
                        foreignField: "posted_by",
                        as: "posts"
                    }
                }
            ]
        )
        if (result.length === 0) {
            return createError(res, 404, "User not found!")
        }
        res.status(200).json({result: result[0]})
    } catch (err) {
        internalServerError(res)
    }
}

const profileEdit = async (req, res) => {
    try {
        const { id, ...rest } = req.body
        const fileBlob = req.files
        if (rest.username) {
            const findUser = await userDB.findOne({ username: rest.username })
            if (findUser) {
                return createError(res, 409, "Username already exist")
            }
        }
        if (fileBlob) {
            const file = fileBlob.pic
            const file_type = file.mimetype.split("/")[0]
            const ext = file.mimetype.split("/")[1]
            const file_id = uuidv4()
            file.mv(`./Public/Images/${file_id}.${ext}`, async (err, resp) => {
                if (err) createError(res, 500, "Internal server error")
                const response = await cloudinaryUpload(`./Public/Images/${file_id}.${ext}`, file_type, "USERS")
                rest.pic = response
                await userDB.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: rest })
            })
        } else {
            await userDB.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: rest })   
        }
        const result = await userDB.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                }, {
                    $lookup: {
                        from: "posts",
                        localField: "_id",
                        foreignField: "posted_by",
                        as: "posts"
                    }
                }
            ]
        )
        res.status(200).json({result: result[0]})
    } catch (err) {
        internalServerError(res)
    }
}

const getSuggestions = async (req, res) => {
    try {
        const { user_id } = req.params
        const findFollowers = await userDB.findOne({ _id: user_id })
        let response = await userDB.find({ $or: [{_id: { $in: findFollowers.followers, $nin: findFollowers.following }}] })
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const follow = async (req, res) => {
    try {
        const { user_id, to_id } = req.body
        const mydb = await userDB.findOne({ _id: new mongoose.Types.ObjectId(user_id), following: new mongoose.Types.ObjectId(to_id) })
        const todb = await userDB.findOne({ _id: new mongoose.Types.ObjectId(to_id), followers: new mongoose.Types.ObjectId(user_id) })
        if (!mydb && !todb) {
            await userDB.updateOne({ _id: new mongoose.Types.ObjectId(user_id) }, { $push: { following: new mongoose.Types.ObjectId(to_id) } })
            await userDB.updateOne({ _id: new mongoose.Types.ObjectId(to_id) }, { $push: { followers: new mongoose.Types.ObjectId(user_id) } })
        } else {
            await userDB.updateOne({ _id: new mongoose.Types.ObjectId(user_id) }, { $pull: { following: new mongoose.Types.ObjectId(to_id) } })
            await userDB.updateOne({ _id: new mongoose.Types.ObjectId(to_id) }, { $pull: { followers: new mongoose.Types.ObjectId(user_id) } })
        }
        const result = await userDB.findOne({ _id: new mongoose.Types.ObjectId(user_id) })
        res.status(200).json({ following: result.following })
    } catch (err) {
        internalServerError(res)
    }
}

export default {
    userLogin,
    signupUser,
    getUsers,
    getMe,
    profileEdit,
    getSuggestions,
    follow,
    getUserByUsername,
    getFollowers,
    getFollowings,
    validUser
}