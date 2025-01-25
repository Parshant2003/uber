const captainModel =require('../models/captain.model');
const Blacklist = require('../models/blacklistToken.model');
const jwt = require('jsonwebtoken');

const authCaptain = async (req, res, next) => {
    try {
        // Get the token from cookies or authorization header
        const token = req.cookies?.token || req.headers.authorization.split(' ')[1];
        console.log("token"+token);
        
        // If no token is found, respond with unauthorized error
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token not provided" });
        }

        // Check if the token is blacklisted
        const blacklistedToken = await Blacklist.findOne({ token: token });
        console.log("bla "+blacklistedToken);
        
        if (blacklistedToken) {
            return res.status(401).json({ message: "Unauthorized: Token is blacklisted" });
        }

        // Verify the token with the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the captain associated with the token
        const captain = await captainModel.findById(decoded._id);
        if (!captain) {
            return res.status(401).json({ message: "Unauthorized: Captain not found" });
        }

        // Attach the captain object to the request and move to the next middleware
        req.captain = captain;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = authCaptain;
