const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrackPost',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userImageUrl: {
        type: String
    },
    text: {
        type: String,
        required: true,
        maxlength: 250
    },
    postedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);