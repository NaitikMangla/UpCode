const express = require('express');
const router = express.Router();

const {handleResult, getProblem} = require('../controller/problem')

router.all('/callback', handleResult)

router.get('/:id', getProblem)

module.exports = router