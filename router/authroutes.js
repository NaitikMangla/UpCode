const express = require('express');
const router = express.Router();

const { register, login, logout, sendverifyOTP, verifyemail, isAuthenticated, sendResetOTP, resetPassword, verify_platforms_id, get_verify_requests, get_all_requests, verify_LC, verify_CF, verify_CC, verify_GFG } = require('../controller/authcontroller');
const userAuth = require('../middleware/userauth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout',logout);
router.post('/send_verify_otp', userAuth, sendverifyOTP);
router.post('/verify_account', userAuth, verifyemail); 
router.get('/is_authenticated', userAuth, isAuthenticated); // changed to get
router.post('/send_reset_otp', sendResetOTP);
router.post('/resend_otp', userAuth, sendverifyOTP); // This route requires userAuth middleware, which verifies the token in the request header
router.post('/reset_password', userAuth, resetPassword); // This route requires userAuth middleware, which verifies the token in the request header
router.post('/verify_platforms_id', userAuth, verify_platforms_id); // This route requires userAuth middleware, which verifies the token in the request header
// router.post('/get_verify_requests', userAuth, get_verify_requests); // This route requires userAuth middleware, which verifies the token in the request header
router.get('/get_all_requests', userAuth, get_all_requests); // This route requires userAuth middleware, which verifies the token in the request header
router.post('/verify_LC', userAuth, verify_LC); // This route requires userAuth middleware, which verifies the token in the request header
router.post('/verify_CF', userAuth, verify_CF); // This route requires userAuth middleware, which verifies the token in the request header

router.post('/verify_CC', userAuth, verify_CC); // This route requires userAuth middleware, which verifies the token in the request header
router.post('/verify_GFG', userAuth, verify_GFG); // This route requires userAuth middleware, which verifies the token in the request header
module.exports = router;