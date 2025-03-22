const {get, set, remove} = require('../services/submitMap')
const problemModel = require('../model/problem');

async function handleSubmission(data, socket) {
    const url = process.env.JUDGE_URL + "?base64_encoded=true&wait=false&fields=*"
    console.log(data.srccode)
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({
            language_id: data.lang,
            source_code: btoa(data.srccode),
            stdin: btoa(data.stdin),
            callback_url: process.env.CALLBACK_URL,
            cpu_time_limit: 5
        })
    }

    try {
        const response = await fetch(url, options);
        result = await response.json();
        socket.emit('submitted')
        set(result.token, socket)
        console.log(result)
        return true
    } catch (error) {
        socket.emit('err', error.message)
        return false;
    }
}

function getOutput(data) {
    switch (data.status.id) {
        case 1:
            return "🕒 In Queue";
        case 2:
            return "⚙️ Processing";
        case 3:
            return  atob(data.stdout)
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

async function handleResult(req, res, next) {
    const data = req.body
    console.log(data)
    let result = getOutput(data)
    let socket = get(data.token)
    socket.emit('codeResult', result)
    remove(data.token)
    return res.json({message: "Result sent to client"})
}

async function getProblem(req, res){
    const problemId = req.params.id
    const problemData = await problemModel.findOne({id : problemId})
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

module.exports = {
    handleSubmission,
    handleResult,
    getProblem,
    getAllProblem
}