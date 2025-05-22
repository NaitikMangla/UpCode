const jwt = require('jsonwebtoken');
const usermodel = require('../model/usermodel');

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No auth-token provided(mw)'});
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findOne({email : payload.email});

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found(mw)'});
        }
        
        req.userData = user
        next();
    } catch (err) {
        console.log("JWT Authentication Error:", err.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid or Expired Token(mw)' });
    }
};

module.exports = userAuth;
