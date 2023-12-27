import mongoose, { Schema, model } from "mongoose";

const userModel = new Schema(
    {
        pic: {
            type: String,
            default: "https://res.cloudinary.com/dmm0xoddf/image/upload/icgcvp0qeeg8ltqnn8k6.webp"
        },
        founder: {
            type: Boolean,
            default: false
        },
        valid_user: {
            type: Boolean,
            default: false
        },
        verified: {
            type: Boolean,
            default: false
        },
        name: {
            type: String,
            required: true
        },
        bio: {
            type: String  
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        followers: [
            {
                type: mongoose.Types.ObjectId
            }
        ],
        following: [
            {
                type: mongoose.Types.ObjectId
            }
        ]
    }, {
        timestamps: true
    }
)

export const userDB = model("users", userModel)