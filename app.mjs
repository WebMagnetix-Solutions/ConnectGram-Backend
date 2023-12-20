import express from "express"
import cors from "cors"
import env from "dotenv"
import userRouter from "./Routes/user.route.mjs"
import postRouter from "./Routes/post.route.mjs"
import * as db from "./Config/dbConnection.mjs" 
import fileUpload from "express-fileupload"

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

app.listen(process.env.PORT || 3001, () => {
    console.log("Server listening ",process.env.PORT || 3001);
})