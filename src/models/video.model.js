import mongoose, { Schema } from 'mongoose'

const videoSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    videoFile: {
        type: String, // cloudinary url
        required: true
    },
    thumbnail: {
        type: String, // cloudinary url
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

export const Video = mongoose.model('Video', videoSchema);