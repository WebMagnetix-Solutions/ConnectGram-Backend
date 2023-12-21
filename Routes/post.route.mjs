import { Router } from "express"
import postController from "../Controllers/post.controller.mjs"

const app = Router()

app.post("/create", postController.createPost)
app.get("/get-all-posts", postController.getAllPosts)
app.get("/get-following-post/:id", postController.getFollowingPost)
app.get("/get-my-posts/:id", postController.getMyPosts)
app.patch("/like", postController.likePost)
app.patch("/save", postController.savePost)
app.get("/saved", postController.getSavedPosts)
app.delete("/delete/:type/:post_id/:unique_id", postController.deletePost)

app.get("/comments/:post_id", postController.comments)
app.post("/add-comment", postController.addComment)
app.patch("/comment/like", postController.likeComment)

export default app