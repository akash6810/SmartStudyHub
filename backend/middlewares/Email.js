
const transporter = require("../middlewares/Email.config")
const {Verification_Email_Template,Welcome_Email_Template} = require('../middlewares/EmailTemplate')

 const sendVerificationEmail=async(email,verificationCode)=>{
    try {
     const response=   await transporter.sendMail({
            from: '"Akash" <${process.env.EMAIL_USER}>',

            to: email, // list of receivers
            subject: "Verify Your Email", // Subject line
            text: "Verify Your Email", // plain text body
            html: Verification_Email_Template.replace("{verificationCode}",verificationCode)
        })
        console.log('Email send Successfully',response)
    } catch (error) {
        console.log('Email error',error)
        throw error
    }

}
 const sendWelcomeEmail=async(email,name)=>{
    try {
     const response=   await transporter.sendMail({
            from: '"Akash" <${process.env.EMAIL_USER}>',

            to: email, // list of receivers
            subject: "Welcome Email", // Subject line
            text: "Welcome Email", // plain text body
            html: Welcome_Email_Template.replace("{name}",name)
        })
        console.log('Email send Successfully',response)
    } catch (error) {
        console.log('Email error',error)
    }
}

module.exports = {sendVerificationEmail,sendWelcomeEmail}