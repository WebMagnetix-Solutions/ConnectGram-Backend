import mongoose from "mongoose";
import { postDB } from "../Models/post.model.mjs";
import { cloudinaryDelete, cloudinaryUpload } from "../Utils/Cloudinary.mjs";
import { v4 as uuidv4 } from "uuid";

const createPost = async (req, res) => {
    try {
        const postData = req.body
        const file = req.files.file
        const file_type = file.mimetype.split("/")[0]
        const ext = file.mimetype.split("/")[1]
        const file_id = uuidv4()
        file.mv(`./Public/Images/${file_id}.${ext}`, async (err, resp) => {
            if (err) createError(res, 500, "Internal server error")
            const response = await cloudinaryUpload(`./Public/Images/${file_id}.${ext}`, file_type)
            postData.url = response
            postData.type = file_type
            const resData = await postDB.create(postData)
            res.status(201).json(
                {
                    result: resData,
                    message: "Post Created"
                }
            )
        })
    } catch (err) {
        console.log(err);
        internalServerError(res)
    }
}

const getAllPosts = async (req, res) => {
    try {
        const response = await postDB.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "posted_by",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ])
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const getMyPosts = async (req, res) => {
    try {
        const {id} = req.params
        const response = await postDB.aggregate([
            {
                $match: {
                    posted_by: new mongoose.Types.ObjectId(id)
                }
            },{
                $lookup: {
                    from: "users",
                    localField: "posted_by",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ])
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const createError = (res, status, message) => {
    res.status(status).json(
        {
            message: message
        }
    )
}

const internalServerError = (res) => {
    res.status(500).json(
        {
            message: "Internal server error"
        }
    )
}

export default {
    createPost,
    getAllPosts,
    getMyPosts
}