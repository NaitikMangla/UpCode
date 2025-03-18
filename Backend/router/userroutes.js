const express = require('express');
const userAuth = require('../middleware/userauth');
const getUserData = require('../controller/usercontroller');
const router = express.Router();

router.get('/data', userAuth, getUserData);

module.exports = router;