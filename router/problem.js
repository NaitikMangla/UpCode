const express = require('express');
const router = express.Router();
const {isAdminCheck} = require('../middleware/adminCheck')

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
router.post('/addProblem',isAdminCheck, addProblem)
router.post('/deleteProblems',isAdminCheck, deleteProblems)
router.post('/updateProblem',isAdminCheck, updateProblem)

module.exports = router