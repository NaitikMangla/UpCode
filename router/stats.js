const express = require('express');
const router = express.Router();
const {
    getLeetcodeStats,
    getGFGStats,
    getCodeforcesStats,
    getCodechefStats
} = require('../controller/stats')
const userAuth = require('../middleware/userauth')

router.get('/leetcode', userAuth, getLeetcodeStats)
router.get('/gfg',userAuth, getGFGStats)
router.get('/codeforces',userAuth, getCodeforcesStats)
router.get('/codechef',userAuth, getCodechefStats)

module.exports = router