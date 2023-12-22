import { Router } from "express"
import postController from "../Controllers/post.controller.mjs"
import { Authentication } from "../Middleware/Authentication.mjs"

const app = Router()

app.post("/create", Authentication, postController.createPost)
app.get("/get-all-posts", Authentication, postController.getAllPosts)
app.get("/single/:post_id", Authentication, postController.getSinglePost)
app.get("/get-following-post/:id", Authentication, postController.getFollowingPost)
app.get("/get-my-posts/:id", Authentication, postController.getMyPosts)
app.patch("/like", Authentication, postController.likePost)
app.patch("/save", Authentication, postController.savePost)
app.get("/saved", Authentication, postController.getSavedPosts)
app.delete("/delete/:type/:post_id/:unique_id", Authentication, postController.deletePost)

app.get("/comments/:post_id", Authentication, postController.comments)
app.post("/add-comment", Authentication, postController.addComment)
app.patch("/comment/like", Authentication, postController.likeComment)

export default app