import mongoose from "mongoose";
import { postDB } from "../Models/post.model.mjs";
import { cloudinaryDelete, cloudinaryUpload } from "../Utils/Cloudinary.mjs";
import { v4 as uuidv4 } from "uuid";
import { userDB } from "../Models/user.model.mjs";
import { commentDB } from "../Models/comments.model.mjs";
import { createError, internalServerError } from "../Utils/Errors.mjs";

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
            postData.tags = postData.tags.split(",")
            const resData = await postDB.create(postData)
            res.status(201).json(
                {
                    result: resData,
                    message: "Post Created"
                }
            )
        })
    } catch (err) {
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
            },{
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "comments"
                }
            },{
                $sort: {
                    createdAt:-1
                }
            }
        ])
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const getSinglePost = async (req, res) => {
    try {
        const response = await postDB.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.params.post_id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "posted_by",
                    foreignField: "_id",
                    as: "user"
                }
            },{
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "comments"
                }
            },{
                $sort: {
                    createdAt:-1
                }
            }
        ])
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const getFollowingPost = async (req, res) => {
    try {
        const { id } = req.params 
        const followingPost = await userDB.findOne({ _id: id })
        const list = followingPost.following
        list.push(new mongoose.Types.ObjectId(id))
        const response = await postDB.aggregate(
            [
                {
                    $match: {
                        posted_by: {
                            $in: list
                        }
                    }
                },{
                    $lookup: {
                        from: "users",
                        localField: "posted_by",
                        foreignField: "_id",
                        as: "user"
                    }
                }, {
                    $lookup: {
                        from: "comments",
                        localField: "_id",
                        foreignField: "post_id",
                        as: "comments"
                    }
                },{
                    $sort: {
                        createdAt:-1
                    }
                }
            ]
        )
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
            },{
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "comments"
                }
            },{
                $sort: {
                    createdAt:-1
                }
            }
        ])
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const likePost = async (req, res) => {
    try {
        const {post_id, user_id} = req.body
        const response = await postDB.findOne({ _id: post_id, likes: new mongoose.Types.ObjectId(user_id) })
        if (response) {
            await postDB.updateOne({ _id: post_id }, { $pull: { likes: new mongoose.Types.ObjectId(user_id) } })
        } else {
            await postDB.updateOne({ _id: post_id }, { $push: { likes: new mongoose.Types.ObjectId(user_id) } })
        }
        const result = await postDB.findOne({ _id: post_id })
        res.status(200).json({result: result})
    } catch (err) {
        internalServerError(res)
    }
}

const savePost = async (req, res) => {
    try {
        const {post_id, user_id} = req.body
        const response = await postDB.findOne({ _id: post_id, saved: new mongoose.Types.ObjectId(user_id) })
        if (response) {
            await postDB.updateOne({ _id: post_id }, { $pull: { saved: new mongoose.Types.ObjectId(user_id) } })
        } else {
            await postDB.updateOne({ _id: post_id }, { $push: { saved: new mongoose.Types.ObjectId(user_id) } })
        }
        const result = await postDB.findOne({ _id: post_id })
        res.status(200).json({result: result})
    } catch (err) {
        internalServerError(res)
    }
}

const deletePost = async (req, res) => {
    try {
        const { type, post_id, unique_id } = req.params
        await cloudinaryDelete([unique_id], type)
        await postDB.deleteOne({ _id: new mongoose.Types.ObjectId(post_id) })
        res.status(200).json({message: "Post deleted"})
    } catch (err) {
        internalServerError(res)
    }
}

const getSavedPosts = async (req, res) => {
    try {
        const {id} = req.params
        const response = await postDB.aggregate([
            {
                $match: {
                    saved: new mongoose.Types.ObjectId(id)
                }
            },{
                $lookup: {
                    from: "users",
                    localField: "posted_by",
                    foreignField: "_id",
                    as: "user"
                }
            },{
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "comments"
                }
            },{
                $sort: {
                    createdAt:-1
                }
            }
        ])
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const comments = async (req, res) => {
    try {
        const response = await commentDB.aggregate(
            [
                {
                    $match: {
                        post_id: new mongoose.Types.ObjectId(req.params.post_id)
                    }
                }, {
                    $lookup: {
                        from: "users",
                        localField: "posted_by",
                        foreignField: "_id",
                        as: "user"
                    }
                },{
                    $sort: {
                        createdAt:-1
                    }
                }
            ]
        )
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const addComment = async (req, res) => {
    try {
        await commentDB.create(req.body)
        const response = await commentDB.aggregate(
            [
                {
                    $match: {
                        post_id: new mongoose.Types.ObjectId(req.body.post_id)
                    }
                }, {
                    $lookup: {
                        from: "users",
                        localField: "posted_by",
                        foreignField: "_id",
                        as: "user"
                    }
                }, {
                    $sort: {
                        createdAt:-1
                    }
                }
            ]
        )
        res.status(200).json({result: response})
    } catch (err) {
        internalServerError(res)
    }
}

const likeComment = async (req, res) => {
    try {
        const {comment_id, user_id} = req.body
        const response = await commentDB.findOne({ _id: comment_id, likes: new mongoose.Types.ObjectId(user_id) })
        if (response) {
            await commentDB.updateOne({ _id: comment_id }, { $pull: { likes: new mongoose.Types.ObjectId(user_id) } })
        } else {
            await commentDB.updateOne({ _id: comment_id }, { $push: { likes: new mongoose.Types.ObjectId(user_id) } })
        }
        const result = await commentDB.findOne({ _id: comment_id })
        res.status(200).json({result: result})
    } catch (err) {
        internalServerError(res)
    }
}

export default {
    createPost,
    getAllPosts,
    getMyPosts,
    likePost,
    deletePost,
    getFollowingPost,
    savePost,
    getSavedPosts,
    comments,
    addComment,
    likeComment,
    getSinglePost
}