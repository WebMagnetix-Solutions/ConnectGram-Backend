import { Router } from "express"
import userController from "../Controllers/user.controller.mjs"
import { Authentication } from "../Middleware/Authentication.mjs"

const app = Router()

app.post("/signup", userController.signupUser)
app.get("/login", userController.userLogin)
app.get("/users", Authentication, userController.getUsers)
app.get("/getMe/:id", Authentication, userController.getMe)
app.patch("/profile/edit", Authentication, userController.profileEdit)

app.get("/suggestions/:user_id", Authentication, userController.getSuggestions)

app.patch("/follow", Authentication, userController.follow)

export default app