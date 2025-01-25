const userModel = require('../models/user.model');
const userService = require('../services/user.services');
const { validationResult } = require('express-validator');
const blacklistModel = require('../models/blacklistToken.model');

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;
    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
    });

    const token = user.generateAuthToken();

    return res.status(201).json({ token, user, message: "User created successfully" });
};

const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = user.generateAuthToken();
        res.cookie("token", token, { httpOnly: true });

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
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const logout = async (req, res) => {
    res.clearCookie("token");
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    await blacklistModel.create({ token });
    res.status(200).json({ message: "Logout successfully" });
};

module.exports = { login, register, getUserProfile, logout };
