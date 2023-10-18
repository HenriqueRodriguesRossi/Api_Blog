const mongoose = require("mongoose")

const CommentsSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    created_at:{
        type: Date,
        default: Date().now
    },
    post: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'Posts' 
    },
    commnet_author:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
})

module.exports = mongoose.model("Comments", CommentsSchema)