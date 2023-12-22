import { Router } from "express"
import chatController from "../Controllers/chat.controller.mjs"
import { Authentication } from "../Middleware/Authentication.mjs"
const app = Router()

app.post("/chat", Authentication, chatController.chat)
app.get("/chats/:user_id", Authentication, chatController.getChatList)
app.get("/messages/:chat_id", Authentication, chatController.getAllMessages)
app.post("/sendMessage", Authentication, chatController.sendMessage)

export default app