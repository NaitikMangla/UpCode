const express = require('express');
const router = express.Router();

const { register, login, logout, sendverifyOTP, verifyemail, isAuthenticated, sendResetOTP, resetPassword } = require('../controller/authcontroller');
const userAuth = require('../middleware/userauth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/send_verify_otp', userAuth, sendverifyOTP);
router.post('/verify_account', userAuth, verifyemail);
router.get('/is_authenticated', userAuth, isAuthenticated); // changed to get
router.post('/send_reset_otp', sendResetOTP);

router.post('/reset_password', userAuth, resetPassword); // This route requires userAuth middleware, which verifies the token in the request header

module.exports = router;