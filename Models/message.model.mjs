import mongoose, { Schema } from "mongoose"
import { model } from "mongoose"

const messageModel = new Schema({
    sender:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"users"
    },
    content:{
        type:String,
        required:true
    },
    chat_id:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"chats"
    }
},{
    timestamps:true
})

export const messageDB = model("messages",messageModel)