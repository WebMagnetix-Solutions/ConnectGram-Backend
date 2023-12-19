import { Router } from "express"
import userController from "../Controllers/user.controller.mjs"

const app = Router()

app.post("/signup", userController.signupUser)
app.get("/login", userController.userLogin)

export default app