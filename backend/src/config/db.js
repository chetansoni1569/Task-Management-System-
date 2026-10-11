const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task_management_db");
        console.log("MongoDB Connected successfully");
    } catch (err) {
        console.log("Database connection error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
