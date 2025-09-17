import dotenv from "dotenv"
dotenv.config()
import { app } from "./app.js"
import connectDB from "./db/db.js"

const PORT = process.env.PORT

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log("Server is started successfully!")
        })
    })
    .catch((err) => {
        console.log("MongoDB is Faild to connected!", err)
    })