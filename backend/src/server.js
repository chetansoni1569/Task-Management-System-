const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Task Management System API", status: "Running" });
});

const { protect } = require("./middleware/authMiddleware");
const authController = require("./controllers/authController");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.get("/api/users", protect, authController.getUsers);

app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
});

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

