const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Please enter name, email, and password" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role === "Admin" ? "Admin" : "User"
      });

      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error during registration", error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Please enter email and password" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error during login", error: err.message });
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await User.find({}, "_id name email role createdAt").sort({ name: 1 });
      res.status(200).json({
        count: users.length,
        users
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error while fetching users", error: err.message });
    }
  }
};

module.exports = authController;
