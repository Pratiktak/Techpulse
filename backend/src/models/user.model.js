const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['user', 'partner', 'admin'],
        default: 'user',
    }
}, {
    timestamps: true
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;