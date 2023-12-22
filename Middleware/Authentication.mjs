import { createError, internalServerError } from "../Utils/Errors.mjs"
import jwt from "jsonwebtoken"
import env from "dotenv"

env.config()

export const Authentication = async (req, res, next) => {
    try{
        const token = req.headers["authorization"]
        if(token?.split(" ")[1] == null){
            return createError(res, 401, "Unauthorized!")
        }else{
            const auth = jwt.verify(token?.split(" ")[1],process.env.JWT_KEY)
            const now = Math.floor(new Date().getTime() / 1000)
            if(auth.exp <= now){
                return createError(res, 401, "Unauthorized!")
            }else{
                next()
            }
        }
    }catch(err){
        internalServerError(res)
    }
}