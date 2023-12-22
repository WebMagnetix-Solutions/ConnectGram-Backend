import mongoose from "mongoose"
import { chatDB } from "../Models/chat.model.mjs"
import { messageDB } from "../Models/message.model.mjs"
import { createError, internalServerError } from "../Utils/Errors.mjs"

const chat = async (req, res) => {
    try {
        const { user_id, to_id } = req.body
        if (!user_id || !to_id) {
            createError(res, 404, "Something error happend")
        } else {
            const existChat = await chatDB.findOne({$and:[{users:{$elemMatch:{$eq:user_id}}},{users:{$elemMatch:{$eq:to_id}}}]}).populate("users", "name username pic")
            if (existChat) {
                res.status(200).json({result: existChat})
            } else {
                const obj = {
                    users: [user_id, to_id],
                    displayName: "sender",
                    lastMessage: ""
                }
                const newChat = await chatDB.create(obj)
                const existChat = await chatDB.findOne({_id: newChat._id}).populate("users", "name username pic")
                res.status(201).json({result: existChat})
            }
        }
    } catch (err) {
        internalServerError(res)
    }
}

const getChatList = async (req, res) => {
    try {
        const { user_id } = req.params  
        const { search } = req.query
        let fullChat = await chatDB.find({ users: { $in: [user_id] } }).populate("users", "name username pic").sort({ updatedAt: -1 })
        if (search) {
            fullChat = fullChat.filter(items => {
                const subArray = items.users.map(item => {
                    if (item.name.toLowerCase().includes(search.toLowerCase()) || item.username.toLowerCase().includes(search.toLowerCase())) {
                        if (user_id === item._id.toString()) {
                            return null
                        } else {
                            return item 
                        }
                    } else {
                        return null
                    }
                })
                const newArray = subArray.filter(item => item !== null)
                return newArray.length>0 && items
            })
        }
        res.status(200).json({ result: fullChat })
    } catch (err) {
        internalServerError(res)
    }
}

const sendMessage = async (req, res, next) => {
    try{
        const {sender,content,chat_id} = req.body.messageData
        const obj = {
            sender:new mongoose.Types.ObjectId(sender),
            content:content,
            chat_id:new mongoose.Types.ObjectId(chat_id)
        }
        let message = await messageDB.create(obj)
        message = await message.populate("sender", "name username pic")
        message = await message.populate("chat_id")
        await chatDB.updateOne({_id:new mongoose.Types.ObjectId(chat_id)},{$set:{lastMessage:content}})
        res.status(200).json({result: message})
    } catch (err) {
        internalServerError(res)
    } 
}

const getAllMessages = async (req, res, next) => {
    try {
        const { chat_id } = req.params
        let message = await messageDB.find({chat_id:new mongoose.Types.ObjectId(chat_id)})
        .populate("sender","name username pic")
        .populate("chat_id")
        res.status(200).json({result: message})
    }catch(err){
        internalServerError(res)
    }
}

export default {
    chat,
    getChatList,
    sendMessage,
    getAllMessages
}