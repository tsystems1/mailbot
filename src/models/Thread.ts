import mongoose from "mongoose";

export interface IThread extends mongoose.Document {
    channel: string;
    user: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

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