import { model, Schema } from "mongoose";

const schema = new Schema({
    channel: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    created_by: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        required: true,
        default() {
            return new Date();
        }
    },
    updated_at: {
        type: Date,
        required: true,
        default() {
            return new Date();
        }
    }
});

export default model('Thread', schema);