const express = require('express');
const router = express.Router();

const {handleResult} = require('../controller/problem')

router.get('/', (req, res, next) => {
    // authenticate
    res.send("Server is working")
})

// router.post('/submit', handleSubmission)
router.all('/callback', handleResult)

module.exports = router