import { Router } from "express"
import userController from "../Controllers/user.controller.mjs"
import { Authentication } from "../Middleware/Authentication.mjs"

const app = Router()

app.post("/signup", userController.signupUser)
app.get("/login", userController.userLogin)
app.get("/valid/:id", userController.validUser)
app.get("/users", Authentication, userController.getUsers)
app.get("/getMe/:id", Authentication, userController.getMe)
app.get("/user", Authentication, userController.getUserByUsername)
app.patch("/profile/edit", Authentication, userController.profileEdit)

app.get("/suggestions/:user_id", Authentication, userController.getSuggestions)

app.patch("/follow", Authentication, userController.follow)
app.get("/get/followers/:user_id", Authentication, userController.getFollowers)
app.get("/get/followings/:user_id", Authentication, userController.getFollowings)

export default app