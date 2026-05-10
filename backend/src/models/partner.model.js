const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
},{
    timestamps: true
});

const partnerModel = mongoose.model("Partner", partnerSchema);

module.exports = partnerModel;