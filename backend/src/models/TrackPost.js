const mongoose = require('mongoose');

const TrackPostSchema = new mongoose.Schema({
    spotifyId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true
    },
    albumImageUrl: {
        type: String
    },
    previewUrl: {
        type: String
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
    likes: {
        type: [String],
        default: []
    },
    postedAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24
    }
}, {
    timestamps: true
});

TrackPostSchema.index({ "postedAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TrackPost', TrackPostSchema);