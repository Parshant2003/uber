const captainModel =require('../models/captain.model');
const captainService = require("../services/captain.Service");
const { validationResult } = require("express-validator");
const blacklistModel = require("../models/blacklistToken.model");   

const registerCaptain = async (req, res) => {
  // Validate the request body
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  // Destructure the incoming request body
  const { fullname, email, password, vehicle } = req.body;

  // Check if all vehicle fields are provided
  if (!vehicle || !vehicle.color || !vehicle.plate || !vehicle.capacity || !vehicle.vehicleType) {
    return res.status(400).json({ error: "All vehicle fields must be provided" });
  }

  // Check if the captain already exists
  const isAlreadyExist = await captainModel.findOne({ email });
  if (isAlreadyExist) {
    return res.status(400).json({ error: "One Captain already exists" });
  }

  // Hash the password
  const hashPassword = await captainModel.hashPassword(password);

  // Create the captain with vehicle details
  const captain = await captainService.createCaptain({
    fullname,
    email,
    password: hashPassword,
    color: vehicle.color,
    plate: vehicle.plate,
    capacity: vehicle.capacity,
    vehicleType: vehicle.vehicleType,
  });

  // Generate auth token
  const token = captain.generateAuthToken();

  // Return the captain details and token
  res.status(201).json({ captain, token });
};



const loginCaptain = async (req, res) => {
    try {
        // Validate the request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract email and password from the request body
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the captain exists
        const captain = await captainModel.findOne({ email }).select('+password');

        // If the captain is not found
        if (!captain) {
            return res.status(404).json({ message: "Captain not found" });
        }

        // Compare the password with the hashed password
        const isPasswordMatch = await captain.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate the auth token
        const token = captain.generateAuthToken();

        // Set the token as an HTTP-only cookie
        res.cookie("token", token, { httpOnly: true });

        // Send the response (without password)
        const { password: _, ...captainWithoutPassword } = captain.toObject();
        res.status(200).json({
            message: "Login successful",
            token,
            captain: {
                id: captainWithoutPassword._id,
                email: captainWithoutPassword.email,
                fullname: captainWithoutPassword.fullname,
                // Add other necessary captain details here
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
const getCaptainProfile = async (req, res) => {
    try {
        // Get the captain details using the _id from the authenticated captain (req.captain)
        const captain = await captainModel.findById(req.captain._id);

        // Check if the captain exists
        if (!captain) {
            return res.status(404).json({ message: "Captain not found" });
        }

        // Return the captain's profile
        res.status(200).json({ captain });
    } catch (error) {
        console.error("Error fetching captain profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logoutCaptain = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie("token");

        // Get the token from the cookies or headers
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(400).json({ message: "Token is missing" });
        }

        // Add the token to the blacklist collection
        await blacklistModel.create({ token });

        // Respond with success message
        res.status(200).json({ message: "Captain logged out successfully" });
    } catch (error) {
        console.error("Error logging out captain:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { registerCaptain,loginCaptain,getCaptainProfile ,logoutCaptain};
