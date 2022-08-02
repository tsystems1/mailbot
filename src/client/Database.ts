import mongoose from "mongoose";

export default class Database {
    constructor(host: string) {
        mongoose.connect(host)
        .then(() => console.log('Database connected'))
        .catch(console.error);
    }
}