const mongoose = require('mongoose');

// Define the BlacklistedToken schema
const blacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true, // Ensure tokens are not duplicated in the blacklist
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // TTL: Automatically delete the document after 24 hours (24*60*60 seconds)
    },
});

// Create the BlacklistedToken model
const Blacklist = mongoose.model('BlacklistedToken', blacklistedTokenSchema);

module.exports = Blacklist;
