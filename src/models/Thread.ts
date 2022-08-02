import mongoose from "mongoose";

const schema = new mongoose.Schema({
    channel: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    }
});

export default mongoose.model('Thread', schema);