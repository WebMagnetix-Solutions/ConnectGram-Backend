import { Router } from "express"
import userController from "../Controllers/user.controller.mjs"

const app = Router()

app.post("/signup", userController.signupUser)
app.get("/login", userController.userLogin)
app.get("/users", userController.getUsers)
app.get("/getMe/:id", userController.getMe)
app.patch("/profile/edit", userController.profileEdit)

app.get("/suggestions/:user_id", userController.getSuggestions)

export default app