const usermodel = require('../model/usermodel');

const getUserData = async (req, res) => {
    try {
        let user = req.userData
        res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
            }
        });

    } catch (err) {
        console.error("Error fetching user data:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = getUserData;
