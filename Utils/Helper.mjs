import { storyDB } from "../Models/story.model.mjs";
import { cloudinaryDelete } from "./Cloudinary.mjs";

export const getPostUniqueId = (cloudinaryURL) => {

    const urlComponents = cloudinaryURL.split('/');

    const lastComponent = urlComponents[urlComponents.length - 1];

    const uniqueID = lastComponent.split('.')[0];

    return uniqueID
}

export const deleteStory = async () => {
    try {
        const currentTime = new Date().getTime()
        const findStories = await storyDB.find({ expireAt: { $lte: currentTime } })
        findStories.forEach(async item => {
            const id = getPostUniqueId(item.url)
            await cloudinaryDelete([id], "image")
        })
        await storyDB.deleteMany({ expireAt: { $lte: currentTime } })
        return {message: "Deleted "+findStories.length+" stories"}
    } catch (err) {
        return {message: "Error"}
    }
}