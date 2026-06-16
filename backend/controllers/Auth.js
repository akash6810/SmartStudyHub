

const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Usermodel = require("../models/User")
const TempUser = require("../models/TempUser")
const { sendVerificationEmail, sendWelcomeEmail } = require("../middlewares/Email")



const register = async (req, res) => {
    try {
        const { email, name, password } = req.body
        if (!email || !name || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        } const ExistsUser = await Usermodel.findOne({ email })
        if (ExistsUser) {
            return res.status(400).json({ success: false, message: "User Already Exists Please Login" })

        }
        const hashedPassowrd = await bcryptjs.hash(password, 10)
        const verficationToken = Math.floor(100000 + Math.random() * 900000).toString()
        const tempUser = new TempUser({
            email,
            name,
            password: hashedPassowrd,
            verificationToken: verficationToken,
            verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000
        });
        await tempUser.save()

        await sendVerificationEmail(email, verficationToken);

        res.json({ message: "OTP sent" });

    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};
const VerfiyEmail = async (req, res) => {
    try {
        const { code } = req.body
        const tempUser = await TempUser.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });
        if (!tempUser) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const newUser = new Usermodel({
            email: tempUser.email,
            name: tempUser.name,
            password: tempUser.password,
            isVerified: true
        });


        await newUser.save();

        await TempUser.deleteOne({ _id: tempUser._id });

        await sendWelcomeEmail(newUser.email, newUser.name);

        res.json({ message: "User verified & created" });

    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: "internal server error" })
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }


        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first"
            });
        }


        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );


        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetPasswordToken = otp;
        user.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min

        await user.save();

        await sendVerificationEmail(email, otp); // reuse your function

        res.json({
            success: true,
            message: "OTP sent to email"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { otp, newPassword } = req.body;

        const user = await Usermodel.findOne({
            resetPasswordToken: otp,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // hash new password
        const hashedPassword = bcryptjs.hashSync(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        res.json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};







module.exports = {
    register,
    VerfiyEmail,
    login,
    forgotPassword,
    resetPassword
};