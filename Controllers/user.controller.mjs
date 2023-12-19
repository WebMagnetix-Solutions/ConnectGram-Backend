import { userDB } from "../Models/user.model.mjs"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import env from "dotenv"

env.config()

const userLogin = async (req, res) => {
    try {
        const { username, password } = req.query
        console.log(req.query);
        const user = await userDB.findOne(
            {
                username: username
            }
        )
        if (!user) {
            createError(res, 404, "User does not exist")
        } else {
            const checkPassword = await bcrypt.compare(password, user.password)
            if (!checkPassword) {
                createError(res, 401, "Invalid credentials")
            } else {
                user.password = ""
                const token = jwt.sign({ sub: user._id }, process.env.JWT_KEY, { expiresIn: "7d" })
                res.status(201).json(
                    {
                        message: "User data fetched",
                        token: token,
                        user: user
                    }
                )
            }
        }
    } catch (err) {
        internalServerError(res)
    }
}

const signupUser = async (req, res) => {
    try {
        const { confirm_password, ...userData } = req.body
        const findUser = await userDB.findOne(
            {
                username: userData.username
            }
        )
        if (findUser) {
            createError(res, 409, "Username already exist")
        } else {
            const findUser = await userDB.findOne(
                {
                    email: userData.email
                }
            )
            if (findUser) {
                createError(res, 409, "Email already exist")
            } else {
                userData.password = await bcrypt.hash(userData.password,10)
                const response = await userDB.create(userData)
                response.password = ""
                const token = jwt.sign({ sub: response._id }, process.env.JWT_KEY, { expiresIn: "7d" })
                res.status(201).json(
                    {
                        message: "New user created",
                        token: token,
                        user: response
                    }
                )
            }
        }
    } catch (err) {
        console.log(err);
        internalServerError(res)
    }
}

const createError = (res, status, message) => {
    res.status(status).json(
        {
            message: message
        }
    )
}

const internalServerError = (res) => {
    res.status(500).json(
        {
            message: "Internal server error"
        }
    )
}

export default {
    userLogin,
    signupUser
}