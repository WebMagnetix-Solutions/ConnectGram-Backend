import mongoose, { Schema, model } from "mongoose";

const commentModel = new Schema(
    {
        post_id: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        posted_by: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        likes: [
            {
              type: mongoose.Types.ObjectId
            }  
        ],
    }, {
        timestamps: true
    }
)

export const commentDB = model("comments", commentModel)