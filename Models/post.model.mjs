import mongoose, { Schema, model } from "mongoose";

const postModel = new Schema(
    {
        url: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: true
        },
        tags: [
            {
                type: String,
                required: true
            }
        ],
        likes: [
            {
              type: mongoose.Types.ObjectId
            }  
        ],
        saved: [
            {
                type: mongoose.Types.ObjectId
            } 
        ],
        location: {
            type: String,
            required: false
        },
        posted_by: {
            type: mongoose.Types.ObjectId,
            required: true
        }
    }, {
        timestamps: true
    }
)

export const postDB = model("posts", postModel)