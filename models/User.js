const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    full_name:{
        type: String,
        required: true
    },
    name_of_user:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    created_at:{
        type: Date,
        default: Date().now
    },
    twoFactorSecret: { 
        type: String 
    }, // Armazenará o segredo do usuário
    isTwoFactorEnabled:{ 
        type: Boolean, 
        default: false 
    }, // Indica se a autenticação de dois fatores está ativada
})

module.exports = mongoose.model("User", UserSchema)