const express = require('express') 
const {register,VerfiyEmail,login,forgotPassword,resetPassword} = require('../controllers/Auth');
const AuthRoutes=express.Router()

AuthRoutes.post('/register',register)
AuthRoutes.post('/verifyEmail',VerfiyEmail)
AuthRoutes.post("/login", login);
AuthRoutes.post("/forgot-password", forgotPassword);
AuthRoutes.post("/reset-password", resetPassword);

module.exports = AuthRoutes