const {Schema, model} = require('mongoose');

const problemSchema = new Schema({
    id : {
        type : String,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true,
        unique : true
    },
    description : {
        type : String,
        required : true,
        unique : true
    },
    inputFormat : {
        type : String,
        required : true
    },
    outputFormat : {
        type : String,
        required : true
    },
    sampleInput : {
        type : String,
        required : true
    },
    sampleOutput:{
        type : String,
        required : true
    },
    explanation : String,
    tag : String,
    topics : {
        type : [String],
        default : []
    },
    constraints : {
        type : String,
        required : true,
    },
    hiddenTestCases : {
        type : [String],
        default : []
    },
    solutions : {
        type : [String],
        default : []
    },
    timeLimit : Number,
    memoryLimit : Number
})

const problemModel = model('Problem', problemSchema)
module.exports = problemModel