const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema({
    email: String,
    name: String,
    password: String,
    verificationToken: String,
    verificationTokenExpiresAt: Date
});

module.exports = mongoose.model("TempUser", tempUserSchema);
