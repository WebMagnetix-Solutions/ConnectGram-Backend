import { Router } from "express"
import serverController from "../Controllers/server.controller.mjs"
const app = Router()

app.get('/status', serverController.status)

export default app