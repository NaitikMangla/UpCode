const {get, set, remove} = require('../services/submitMap')
const {get : jget, set : jset, remove : jremove} = require('../services/judgeMap')
const problemModel = require('../model/problem');

async function getProblem(req, res){
    const problemId = req.params.id
    const problemData = await problemModel.findOne({id : problemId}, {_id : 0, hiddenTestCases : 0, solutions : 0})
    console.log({problemId, problemData})
    if(!problemData)
    {
        return res.json({error : "fail"})
    }
    return res.json(problemData)
}

async function getAllProblem(req, res){
    const problemData = await problemModel.find({},{_id:0, title : 1, id : 1})
    if(!problemData)
    {
        return res.json({error : "fail"})
    }
    return res.json(problemData)
}

function stringToArray(str, regex)
{
    let array = str.split(regex)
    // console.log(array)
    array = array.map((item) => item?.trim()).filter((item) => item !== "" && item !== undefined && item !== null);
    return array
}

async function addProblem(req, res, next){
    const data = req.body
    // console.log(data)

    // Check for empty fields --> Not accepted
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if(key != 'timeLimit' && key != 'memoryLimit' && (data[key] == "" || data[key] == undefined || data[key] == null))
            {
                return res.json({error : `${key} is required`})
            }
        }
    }

    // Check for uniqueness of problem ID and title
    const problemExists = await problemModel.exists({
        $or: [
            { title: data.title },
            { id: data.id }
        ]
    });

    if(problemExists) 
    {
        return res.json({error : 'ID or title already exists'})
    }

    // Processing Data into appropriate form
    const keys = ["topics","hiddenTestCases", "solutions","timeLimit", "memoryLimit"]
    data.hiddenTestCases = stringToArray(data.hiddenTestCases, /(\n{2,})|((\r\n){2,})/)
    data.solutions = stringToArray(data.solutions, /(\n{2,})|((\r\n){2,})/)
    data.topics = stringToArray(data.topics, /,/)
    if(data.timeLimit) data.timeLimit = Number(data.timeLimit)
    if(data.memoryLimit) data.memoryLimit = Number(data.memoryLimit)
    for (const key in data) {
        if(!keys.includes(key))
        {
            data[key] = data[key].trim()
        }
    }

    // Create Doc and save to DB
    await problemModel.create(data)
    return res.status(202).json({message : "Problem added successfully"})
}

async function handleRun(data, socket) {
    const url = process.env.JUDGE_URL + "?base64_encoded=true&wait=false&fields=*"
    // console.log(data.srccode)
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            language_id: data.lang,
            source_code: btoa(data.srccode),
            stdin: btoa(data.stdin),
            callback_url: process.env.CALLBACK_URL + "/run", // webhooks
            cpu_time_limit: data.timeLimit || 5, // deafult to 5 seconds
            memory_limit : data.memoryLimit || 262144 // default to 256 mb
        })
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        socket.emit('runCode')
        set(result.token, socket)
        console.log(result)
        return true
    } catch (error) {
        console.log('Run Error --> ', error.message)
        socket.emit('error', error.message)
        return false;
    }
}

async function handleSubmit(data, socket, testNumber){
    const url = process.env.JUDGE_URL + "?base64_encoded=true&wait=false&fields=*"
    console.log(data)
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({
            language_id: data.lang,
            source_code: btoa(data.srccode),
            stdin: btoa(data.stdin),
            callback_url: process.env.CALLBACK_URL + "/submit", // webhooks
            cpu_time_limit: data.timeLimit || 5, // deafult to 5 seconds
            memory_limit : data.memoryLimit * 1024 || 262144 // default to 256*1024kb (256mb)
        })
    }

    try{
        const response = await fetch(url, options);
        const result = await response.json();
        set(result.token, socket)
        socket.emit('processing', {testNumber})
        return true
    }
    catch(err){
        socket.emit('error', err.message)
        console.log('Submission Error --> ', err.message)
        return false;
    }
}

function normalizeResult(str){
    str = str.replace(/\r\n/g, '\n').trim();
    return str
}

function judgeSolution(output, expectedOutput) {
    console.log({output, expectedOutput})
    return normalizeResult(output) === normalizeResult(expectedOutput)
}

function getOutput(data) {
    switch (data.status.id) {
        case 1:
            return "🕒 In Queue";
        case 2:
            return "⚙️ Processing";
        case 3:
            return data.stdout!=null? atob(data.stdout) : "No output!"
        case 4:
            return  "Wrong answer"
        case 5:
            return "⏳ Time Limit Exceeded";
        case 6:
            return   Buffer.from(data.compile_output, "base64").toString("utf-8");
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
            return data.stderr?Buffer.from(data.stderr, "base64").toString("utf-8"):"Runtime Error";
        case 13:
            return "⚠️ Internal Error";
        case 14:
            return "⚠️ Exec Format Error";
        default:
            return "❓ Unknown Status";
    }
}

async function handleRunResult(req, res, next) {
    const data = req.body
    const result = {
        output: getOutput(data),
        timeUtilized: Number(data.time), // in seconds
        memoryUtilized: Number(data.memory) // in kb
    }
    let socket = get(data.token)
    socket.emit('runResult', result)
    remove(data.token)
    return res.json({message: "Result sent to client"})
}

function handleSubmitResult(req, res, next){
    const data = req.body
    const socket = get(data.token)
    const judgeObj = jget(socket.id)
    const accepted = judgeSolution(getOutput(data), judgeObj.getExpectedOutput())
    console.log("verdict : ", accepted)
    if(accepted)
    {
        console.log("Accepted")
        socket.emit("testPassed", {testNumber : judgeObj.getTestNumber()})
        judgeObj.resume()
    }
    else{
        console.log("Not Accepted")
        socket.emit("testFailed", {testNumber : judgeObj.getTestNumber()})
        judgeObj.end("rejected")
    }
    remove(data.token)
    return res.json({message: "Result sent to client"})
}

module.exports = {
    handleRun,
    handleRunResult,
    handleSubmit,
    handleSubmitResult,
    getProblem,
    getAllProblem,
    addProblem
}