import express from "express"
import cors from "cors"
import env from "dotenv"
import userRouter from "./Routes/user.route.mjs"
import * as db from "./Config/dbConnection.mjs"

env.config()

const app = express()

app.use(cors({
    origin: "*",
    methods: "*"
}))

db.setConnection()

app.use(express.json())

app.use("/api/user", userRouter)

app.listen(process.env.PORT || 3001, () => {
    console.log("Server listening ",process.env.PORT || 3001);
})