// routes logic

const userModel = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const generateToken = require('../config/utils.js');

// controllers
async function registerUser(req, res) {

    let { email, fullName, password } = req.body;

    try {
        // check if user already exists
        const isUserAlreadyExists = await userModel.findOne({ email });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "User already exixts"
            });
        }

        // encrypting password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // creating new user
        const newUser = await userModel.create({
            fullName: fullName,
            email: email,
            password: hashPassword,
            role: "user"
        });

        if (newUser) {
            // Generate JWT token here
            generateToken(newUser._id, res);

            // sending user to frontend
            res.status(201).json({
                message: "User Registered sucessfully",
                user: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } else {
            res.status(400).json({
                message: "Invalid user data"
            });
        }
    } catch (error) {
        console.log("Error in register controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function loginUser(req, res) {
    // user will send us email and password we will check if user exist with this email then we can check password is correct if correct "you can login" else "you cannot (Invalid credentials)"

    let { email, password } = req.body;

    try {
        // check if user exists
        const user = await userModel.findOne({ email });

        // throw error if user dose not exists
        if (!user) {
            return res.status(400).json({
                message: "Inavlid email or password"
            });
        }

        // check weather password is corrcct 
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        // if password is correct
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Inavlid email or password"
            });
        }

        // generate token if email and password is correct
        generateToken(user._id, res)

        // sending user to frontend
        res.status(200).json({
            message: "User logged in Sucessfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

function logoutUser(req, res) {
    // if user logout clear the cookies
    try {
        res.cookie("token", "", { maxAge: 0, httpOnly: true, sameSite: "none", secure: true, path: "/" });
        res.status(200).json({
            message: "User logged out Sucessfully"
        })
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }

}

async function getMe(req, res) {
    res.status(200).json({
        user: req.user
    });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe
}