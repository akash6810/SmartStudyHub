const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verficationToken: String, 
    verficationTokenExpiresAt: Date,
    
    // ✨ NEW FIELDS FOR PAYMENT SYSTEM ✨
    
    // Tracks how much money the user has made from their uploaded PDFs
    walletBalance: {
        type: Number,
        default: 0,
    },
    
    // Tracks the specific PDFs the user has successfully purchased
    purchasedPdfs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pdf' // This tells Mongoose to link these IDs to your Pdf model
    }],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
    
}, { timestamps: true });

const Usermodel = mongoose.model('User', UserSchema);

module.exports = Usermodel;