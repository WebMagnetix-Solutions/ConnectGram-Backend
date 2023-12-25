import mongoose from "mongoose"
import { storyDB } from "../Models/story.model.mjs"
import { userDB } from "../Models/user.model.mjs"
import { cloudinaryDelete, cloudinaryUpload } from "../Utils/Cloudinary.mjs"
import { createError, internalServerError } from "../Utils/Errors.mjs"
import { v4 as uuidv4 } from "uuid"
import { getPostUniqueId } from "../Utils/Helper.mjs"

const deleteStory = async () => {
    try {
        const stories = await storyDB.aggregate([
            {
                $project: {
                    document: "$$ROOT",
                    createdAt: 1,
                    timeDiff: {
                        $subtract: [
                            new Date(),
                            {
                                $toDate: "$createdAt"
                            }
                        ]
                    }
                }
            },{
                $project: {
                    document: 1,
                    createdAt: 1,
                    timeDifferenceInHours: {
                        $divide: ["$timeDiff", 1000 * 60 * 60]
                    }
                }
            },{
                $match: {
                timeDifferenceInHours: { $gt: 24 }
                }
            }
        ])
        if (stories.length > 0) {
            const images = stories.filter(item => getPostUniqueId(item.document.url))
            const ids = stories.filter(item => item.document._id)
            await storyDB.deleteMany({_id: {$in:ids}})
            await cloudinaryDelete([images], "image")
        }
        return true
    } catch (err) {
        console.log(err)
    }
}

const addStory = async (req, res) => {
    try {
        const storyData = req.body
        const findExist = await storyDB.findOne({ posted_by: storyData.posted_by })
        if (findExist) {
            return createError(res, 409, "Only 1 story at a time as a test run")
        }
        const file = req.files.file
        const file_type = file.mimetype.split("/")[0]
        const ext = file.mimetype.split("/")[1]
        const file_id = uuidv4()
        file.mv(`./Public/Images/${file_id}.${ext}`, async (err, resp) => {
            if (err) createError(res, 500, "Internal server error")
            const response = await cloudinaryUpload(`./Public/Images/${file_id}.${ext}`, file_type)
            storyData.url = response
            storyData.type = file_type
            const resData = await storyDB.create(storyData)
            const findStory = await storyDB.aggregate([
                {
                    $match: {
                        posted_by: new mongoose.Types.ObjectId(resData.posted_by)
                    }
                }, {
                    $lookup: {
                        from: "users",
                        localField: "posted_by",
                        foreignField: "_id",
                        pipeline: [{
                            $project: {
                                _id: 1,
                                name: 1,
                                username: 1,
                                pic: 1
                            }
                        }],
                        as: "user"
                    }
                }
            ])
            res.status(201).json(
                {
                    result: findStory[0],
                    message: "story added"
                }
            )
        })
    } catch (err) {
        internalServerError(res)
    }
}

const getStories = async (req, res) => {
    try {
        const { user_id } = req.params
        const findFollowings = await userDB.findOne({ _id: user_id })
        findFollowings?.following?.push(new mongoose.Types.ObjectId(user_id))
        const findStories = await storyDB.aggregate([
            {
                $match: {
                    posted_by: { $in: findFollowings.following }
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "posted_by",
                    foreignField: "_id",
                    pipeline: [{
                        $project: {
                            _id: 1,
                            name: 1,
                            username: 1,
                            pic: 1
                        }
                    }],
                    as: "user"
                }
            }, {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        res.status(200).json({message: "Fetched", result: findStories})
    } catch (err) {
        console.log(err);
        internalServerError(res)
    }
}

const updateView = async (req, res) => {
    try {
        const { story_id, user_id } = req.body
        await storyDB.updateOne({ _id: story_id },{$addToSet: {views: new mongoose.Types.ObjectId(user_id)}})
        res.status(200).json({message: "Updated", result: true})
    } catch (err) {
        console.log(err);
        internalServerError(res)
    }
}

const deleteSingleStory = async (req, res) => {
    try {
        const { story_id } = req.params
        const response = await storyDB.findOne({_id: story_id})
        const ids = getPostUniqueId(response.url)
        await cloudinaryDelete([ids], "image")
        await storyDB.deleteOne({ _id: story_id })
        await getStories(req, res)
    } catch (err) { 
        internalServerError(res)
    }
}

export default {
    addStory,
    getStories,
    updateView,
    deleteStory,
    deleteSingleStory
}