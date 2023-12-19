import { Schema, model } from "mongoose";

const userModel = new Schema(
    {
        name: {
            type: String,
            required: true
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
        }
    }, {
        timestamps: true
    }
)

export const userDB = model("users", userModel)