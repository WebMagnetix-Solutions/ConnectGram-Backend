import mongoose from "mongoose"

export const setConnection = () => {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log("Database Connected");
    }).catch(err => {
        console.log(err)
    })
}