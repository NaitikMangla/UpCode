const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verifyOTP: {
        type: String,
        default: ''
    },
    verifyOTPExpireAt: {
        type: Number,
        default: 0
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    resetOTP: {
        type: String,
        default: ''
    },
    resetOTPExpireAt: {
        type: Number,
        default: 0
    },
    leetcode_id: {
        type: String,
        default: ''
    },
    gfg_id: {
        type: String,
        default: ''
    },
    codeforces_id: {
        type: String,
        default: ''
    },
    codechef_id: {
        type: String,
        default: ''
    },
    // leetcode_status: {
    //     type: Number,
    //     default: 0
    // },
    // gfg_status: {
    //     type: Number,
    //     default: 0
    // },
    // codeforces_status: {
    //     type: Number,
    //     default: 0
    // },
    // codechef_status: {
    //     type: Number,
    //     default: 0
    // },
    isleetcodeVerified: {
        type: Boolean,
        default: false
    },
    isgfgVerified: {
        type: Boolean,
        default: false
    },
    iscodeforcesVerified: {
        type: Boolean,
        default: false
    },
    iscodechefVerified: {
        type: Boolean,
        default: false
    },
    isAdmin : {
        type : Boolean,
        default : false
    }
})

const usermodel = mongoose.models.user || mongoose.model('user', userSchema); // content before OR is to check user is present or not otherwise create the user 
module.exports = usermodel;