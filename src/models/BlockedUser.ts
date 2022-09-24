import mongoose from "mongoose";

const schema = new mongoose.Schema({
    discordID: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        required: true,
    }
});

export default mongoose.model('BlockedUser', schema);