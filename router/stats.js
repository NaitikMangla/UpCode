const express = require('express');
const router = express.Router();
const {
    getLeetcodeStats,
    getGFGStats,
} = require('../controller/stats')
const userAuth = require('../middleware/userauth')

router.get('/leetcode', userAuth, getLeetcodeStats)
router.get('/gfg',userAuth, getGFGStats)

module.exports = router