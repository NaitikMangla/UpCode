const {Schema, model} = require('mongoose')

const submissionSchema = new Schema({
    problemID : {
        type : String,
        required : true,
    },
    userMail : {
        type : String,
        required : true
    },
    srccode : {
        type : String,
        required : true
    },
    language : {
        type : String,
        required : true
    },
    verdict : {
        type : String,
        required : true,
    },
    runtime : {
        type : Number,
        required : true
    },
    memory : {
        type : Number,
        required : true
    },
    timestamp: {
    type: Date,
    default: () => new Date(),
    required: true,
  },
})

submissionSchema.index({ userID: 1, timestamp: -1 });

const submissionModel = model('submission', submissionSchema)
module.exports = submissionModel