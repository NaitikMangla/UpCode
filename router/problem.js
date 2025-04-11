const express = require('express');
const router = express.Router();

const {handleRunResult, handleSubmitResult, getProblem, getAllProblem} = require('../controller/problem')

router.all('/callback/run', handleRunResult)
router.all('/callback/submit', handleSubmitResult)
router.get('/all', getAllProblem)
router.get('/:id', getProblem)

module.exports = router