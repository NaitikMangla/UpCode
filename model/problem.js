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
    sample : {
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
    hiddenTestcase : {
        type : [String],
        default : []
    },
    solutions : {
        type : [String],
        default : []
    }
})

const problemModel = model('Problem', problemSchema)
module.exports = problemModel