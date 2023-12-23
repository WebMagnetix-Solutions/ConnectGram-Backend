import { internalServerError } from "../Utils/Errors.mjs"

const status = async (req, res) => {
    try {
        res.status(200).json({status: "Ok", time: Math.floor(new Date().getTime()/1000)})
    } catch (err) {
        internalServerError(res)
    }
}
 
export default {
    status
}