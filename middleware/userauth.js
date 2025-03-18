const jwt = require('jsonwebtoken');
const usermodel = require('../model/usermodel');

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findById(payload.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        req.userId = user._id;

        next(); 
    } catch (err) {
        console.error("JWT Authentication Error:", err.message); 
        return res.status(401).json({ error: 'Unauthorized: Invalid or Expired Token' });
    }
};

module.exports = userAuth;
