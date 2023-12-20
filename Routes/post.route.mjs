import { Router } from "express"
import postController from "../Controllers/post.controller.mjs"

const app = Router()

app.post("/create", postController.createPost)
app.get("/get-all-posts", postController.getAllPosts)
app.get("/get-my-posts/:id", postController.getMyPosts)

export default app