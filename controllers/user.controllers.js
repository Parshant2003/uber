const userModel=require('../models/user.model');
const userService=require('../services/user.services')
const {validationResult}=require('express-validator')


// user.controller.js
const register = async (req, res, next) => {
    console.log("req"+req.body);
    
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
