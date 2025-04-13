const express = require('express');
const router = express.Router();

const {handleRunResult, handleSubmitResult, getProblem, getAllProblem, addProblem} = require('../controller/problem')

// Router URL : /problem

router.all('/callback/run', handleRunResult)
router.all('/callback/submit', handleSubmitResult)
router.get('/all', getAllProblem)
router.get('/:id', getProblem)
router.post('/addProblem', addProblem)

module.exports = router