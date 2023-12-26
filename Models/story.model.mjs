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
    ]
},{
    timestamps: true,
    expireAfterSeconds: 86400
})

export const storyDB = model("stories", storyModel)