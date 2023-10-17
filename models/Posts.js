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
    comments:{
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User' 
    },
    created_at:{
        type: Date, 
        default: Date().now
    },
})

module.exports = mongoose.model("Posts", PostSchema)