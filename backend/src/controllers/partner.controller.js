const partnerModel = require("../models/partner.model.js");
const userModel = require("../models/user.model.js");

// list all partner applications (admin)
const getAllPartners = async (req, res) => {
    try {
        const partners = await partnerModel
            .find({})
            .populate("user")
            .sort({ createdAt: -1 });
        res.status(200).json({ partners });
    } catch (error) {
        console.log("Error in getAllPartners controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// approve partner
const approvePartner = async (req, res) => {
    try {
        const partner = await partnerModel.findById(req.params.id);

        if (!partner) {
            return res.status(404).json({ message: "Partner not found" });
        }

        partner.isApproved = true;
        partner.status = "approved";
        await partner.save();

        // Updateing user role to "partner"
        const user = await userModel.findById(partner.user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = "partner";
        await user.save();

        res.status(200).json({
            message: "Partner approved successfully",
            partner
        });
    } catch (error) {
        console.log("Error in approvePartner controller ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// reject partner
const rejectPartner = async (req, res) => {
    try {
        const partner = await partnerModel.findById(req.params.id);
        if (!partner) {
            return res.status(404).json({ message: "Partner not found" });
        }
        partner.isApproved = false;
        partner.status = "rejected";
        await partner.save();

        // ensure user role drops back to user
        const user = await userModel.findById(partner.user);
        if (user && user.role === "partner") {
            user.role = "user";
            await user.save();
        }

        res.status(200).json({ message: "Partner rejected", partner });
    } catch (error) {
        console.log("Error in rejectPartner controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// apply for partner
const applyForPartner = async (req, res) => {
    try {
        const { businessName, phone, address } = req.body;

        // check if user already applied
        const existingPartner = await partnerModel.findOne({
            user: req.user._id
        });

        if(existingPartner) {
            return res.status(400).json({
                message: "you have already applied for partner"
            });
        }

        // if not applied then create partner
        const partner = await partnerModel.create({
            user: req.user._id,
            businessName,
            phone,
            address
        });

        res.status(201).json({
            message: "Partner application sumbitted sucessfully",
            partner
        });
    } catch (error) {
        console.log("Error in applyForPartner controller ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getMyPartner = async (req, res) => {
    try {
        const partner = await partnerModel.findOne({
            user: req.user._id
        });

        res.status(200).json({
            partner
        });
    } catch (error) {
        console.log(
            "Error in getMyPartner:",
            error.message
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    approvePartner,
    rejectPartner,
    applyForPartner,
    getMyPartner,
    getAllPartners
};