import env from "dotenv"
import { v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

env.config()

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
)

export const cloudinaryUpload = async (path, type) => {
    try {
        const response = await cloudinary.uploader.upload(path, {resource_type: type})
        fs.unlinkSync(path)
        return response.url
    } catch (err) {
        console.log(err);
    }
}

export const cloudinaryDelete = async (array) => {
    try {
        const response = await cloudinary.api.delete_resources(array, { type: 'upload', resource_type: 'image' })
        return response
    } catch (err) {
        console.log(err)
    }
}