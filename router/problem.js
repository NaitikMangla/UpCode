const express = require('express');
const router = express.Router();

const {
    handleRunResult,
    handleSubmitResult,
    getProblem,
    getAllProblem,
    addProblem,
    deleteProblems,
    getCompleteProblem,
    updateProblem
} = require('../controller/problem')

// Router URL : /problem

router.all('/callback/run', handleRunResult)
router.all('/callback/submit', handleSubmitResult)
router.get('/all', getAllProblem)
router.get('/:id', getProblem)
router.get('/get/:id', getCompleteProblem)
router.post('/addProblem', addProblem)
router.post('/deleteProblems', deleteProblems)
router.post('/updateProblem', updateProblem)

module.exports = router