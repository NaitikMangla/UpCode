const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usermodel = require('../model/usermodel');

export const register = async (req, res) => {
    const {name , email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({error: 'All fields are required'});
    }

    try{
        const existinguser = await usermodel.findOne({email});
        if(existinguser){
            return res.status(400).json({error: 'User already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new usermodel({
            name,
            email,
            password: hashedPassword
        });
    } catch(err){
        return res.status(500).json({error: 'Internal server error'});
    }
}