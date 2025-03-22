const jwt = require('jsonwebtoken');
const usermodel = require('../model/usermodel');

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        console.log({token})
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided(mw)'});
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        console.log(payload)
        const user = await usermodel.findOne({email : payload.email});
        console.log(user)
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found(mw)'});
        }
        req.userData = user
        next();
    } catch (err) {
        console.error("JWT Authentication Error:", err.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid or Expired Token' });
    }
};

module.exports = userAuth;
