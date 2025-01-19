const userModel=require('../models/user.model');
const userService=require('../services/user.services')
const {validationResult}=require('express-validator')


// user.controller.js
const register = async (req, res, next) => {
    
    
    const errors = validationResult(req); // Validate input
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const {fullname, email, password } = req.body;

    const hashedPassword = await userModel.hashPassword(password); // Hash password

    // Create user in the database
    const user = await userService.createUser({
        firstname:fullname.firstname,
        lastname:fullname.lastname,
        email,
        password: hashedPassword,
    });

    // Generate token using instance method
    const token = user.generateAuthToken();

    return res.status(201).json({
        token,
        user,
        message: "User created successfully",
    });
};
module.exports = { register };

const login = async (req, res) => {
    try {
        const errors = validationResult(req); // Validate input
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find user by email
        const user = await userModel.findOne({ email }).select('+password');
        console.log("user-"+user);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare the password (ensure bcrypt is used correctly here)
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token (assuming you have a method for this in the user model)
        const token = user.generateAuthToken();
        res.cookie("token",token,{httpOnly:true});

        // Respond with success
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports={login,register}