import { Schema, Types, model } from "mongoose"

const storyModel = new Schema({
    posted_by:{
        type: Types.ObjectId,
        required: true
    },
    type: {
        type: String
    },
    url: {
        type: String,
        required: true
    },
    views: [
        {
            type: Types.ObjectId
        }
    ],
    expireAt: {
        type: Number,
        default: new Date().getTime() + (86400*1000)
    }
},{
    timestamps: true
})

export const storyDB = model("stories", storyModel)