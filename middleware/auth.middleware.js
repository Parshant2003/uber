const userModel = require('../models/user.model');
const Blacklist = require("../models/blacklistToken.model") // Ensure you import the blacklist model
const jwt = require('jsonwebtoken');

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token not provided" });
        }

        // Check if the token is blacklisted
        const blacklistedToken = await Blacklist.findOne({token: token });
        if (blacklistedToken) {
            return res.status(401).json({ message: "Unauthorized: Token is blacklisted" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the token
        const user = await userModel.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        // Attach the user to the request object and proceed
        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = authUser;
