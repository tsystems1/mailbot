import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    channel: string;
    user: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    discordID: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
});

export default mongoose.model('User', schema);