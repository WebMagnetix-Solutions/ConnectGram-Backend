import mongoose, { Schema, model } from "mongoose"

const chatModel = new Schema({
    displayName:{
        type:String,
        required:true
    },
    users:[{
        type: mongoose.Types.ObjectId,
        ref:"users"
    }],
    lastMessage:{
        type:String
    }
},{
    timestamps:true,
    strict:false
})

export const chatDB = model("chats", chatModel)