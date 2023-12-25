import { Router } from "express"
import storyController from "../Controllers/story.controller.mjs"

const app = Router()

app.post("/add/new", storyController.addStory)
app.get("/get/stories/:user_id", storyController.getStories)
app.patch("/update/view", storyController.updateView)
app.delete("/delete/story/:story_id/:user_id", storyController.deleteSingleStory)

export default app