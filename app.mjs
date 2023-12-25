import express, { response } from "express"
import cors from "cors"
import env from "dotenv"
import userRouter from "./Routes/user.route.mjs"
import postRouter from "./Routes/post.route.mjs"
import chatRouter from "./Routes/chat.route.mjs"
import serverRouter from "./Routes/api.status.route.mjs"
import storyRouter from "./Routes/story.route.mjs"
import * as db from "./Config/dbConnection.mjs" 
import fileUpload from "express-fileupload"
import { Server } from "socket.io"
import cron from "node-cron"
import bot from "./Config/Telegram.mjs"
import axios from "axios"
import storyController from "./Controllers/story.controller.mjs"

env.config()

const app = express()

app.use(cors({
    origin: "*",
    methods: "*"
}))
app.use(fileUpload()) 
db.setConnection()

app.use(express.json())

app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/chat", chatRouter)
app.use("/api/server", serverRouter)
app.use("/api/story", storyRouter)

cron.schedule("* * * * *", async () => {
    await storyController.deleteStory()
    axios.get(process.env.SERVER + "/api/server/status").then(async ({data: response}) => {
        await bot.sendMessage(process.env.ADMIN, `<code>${JSON.stringify(response)}</code>`, {parse_mode: "HTML"})
    }).catch(async err => {
        console.log(err.message);
    })
})

const server = app.listen(process.env.PORT || 3001, () => {
    console.log("Server listening ",process.env.PORT || 3001);
})

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket) => {

    socket.on("setup", (user_id) => {
        socket.join(user_id)
    })

    socket.on("newMessage",(messageData)=>{
        const chat = messageData.chat_id
        if (!chat.users) { console.log("not defined!"); return }
        chat.users.forEach(user => {
            if (user != messageData.sender._id) {
                socket.in(user).emit("ReceivedMessage",messageData)
            }
        })
    })

})