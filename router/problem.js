const express = require('express');
const router = express.Router();

const {handleResult, getProblem, getAllProblem} = require('../controller/problem')

router.all('/callback', handleResult)
router.get('/all', getAllProblem)
router.get('/:id', getProblem)

module.exports = router 