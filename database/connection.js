const mongoose = require("mongoose")
const user = process.env.USER
const pass = process.env.PASS

function connectToDb(){
    mongoose.connect(`mongodb+srv://${user}:${pass}@cluster0.4mchkbr.mongodb.net/?retryWrites=true&w=majority`)

    const connection = mongoose.connection

    connection.on("open", ()=>{
        console.log("Conectado com sucesso!")
    })

    connection.on("error", (error)=>{
        console.log("Erro ao conectar: " + error)
    })
}

connectToDb()
module.exports = mongoose