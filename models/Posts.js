const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User' 
    },
    created_at:{
        type: Date, 
        default: Date().now
    }
})

module.exports = mongoose.model("Posts", PostSchema)