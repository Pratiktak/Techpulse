const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model.js');
const partnerModel = require('../models/partner.model.js');

const protectRoute = async (req, res, next) => {
    try {
        // check if token is ther or not
        const token = req.cookies.token;

        // if token is not there
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - no token provided" });
        }

        // check if token is valid or not
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // if decoded is false means it is invalid
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - invalid token" });
        }

        // try to find user in database
        const user = await userModel.findById(decoded.userId).select("-password");

        // if user not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // if we pass every check means user is authenticated
        // if user is authenticated add user to the request then call the next function
        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

const isPartner = async (req, res, next) => {
    try {
        // try to find partner in database
        const partner = await partnerModel.findOne({ user: req.user._id });

        // if partner not found
        if (!partner) {
            return res.status(404).json({ message: "Not a partner" });
        }

        // check if partner is approved
        if (!partner.isApproved) {
            return res.status(403).json({ message: "Partner not approved yet" });
        }

        req.partner = partner;

        next();
    } catch (error) {
        console.log("Error in isPartner middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

const isAdmin = async (req, res, next) => {
    try {
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            return res.status(403).json({
                message: "Access denied - Admin only"
            });
        }
    } catch (error) {
        console.log("Error in admin middleware ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    protectRoute,
    isPartner,
    isAdmin
}