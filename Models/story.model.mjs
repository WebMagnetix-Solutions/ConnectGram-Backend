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
        type: Date,
        default: Date.now,
        index: {
            expires: 30
        }
    }
},{
    timestamps: true
})

export const storyDB = model("stories", storyModel)