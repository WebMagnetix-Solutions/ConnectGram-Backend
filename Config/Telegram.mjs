import Tg from "node-telegram-bot-api"
import env from "dotenv"

env.config()

const bot = new Tg(process.env.BOT_API, {
    polling: true
})

export default bot