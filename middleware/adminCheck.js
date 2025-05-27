const jwt = require('jsonwebtoken');

const isAdminCheck = async (req, res, next) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No auth-token provided(mw)'});
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (!payload.isAdmin) {
            return res.status(401).json({ error: 'Unauthorized: You are not an admin!'});
        }
        next();
    } catch (err) {
        console.log("JWT Authorization Error:", err.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid or Expired Token(mw)' });
    }
};

module.exports = {isAdminCheck};
