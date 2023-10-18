const express = require("express")
const app = express()
require("dotenv").config()
require("./database/connection")

app.use(express.json())
app.use(express.urlencoded({extended: false}))

const UserRouter = require("./controllers/UserController")
app.use(UserRouter)

const PostRouter = require("./controllers/PostController")
app.use(PostRouter)

const CommentRouter = require("./controllers/CommentsController")
app.use(CommentRouter)

app.listen(8080, ()=>{
    console.log("Servidor rodando na porta 8080!")
})