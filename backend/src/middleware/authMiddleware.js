const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "no token, authorization denied" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found with this token" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.log("auth handlerr error :", err.message);
        return res.status(401).json({ message: "token is not valid" });
    }
};

module.exports = { protect };
