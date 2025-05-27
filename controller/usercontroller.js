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
                isAdmin : user.isAdmin,
                leetcode_id : user.leetcode_id,
                gfg_id : user.gfg_id,
                codeforces_id : user.codeforces_id,
                codechef_id : user.codechef_id,
                isleetcodeVerified : user.isleetcodeVerified,
                isgfgVerified : user.isgfgVerified,
                iscodeforcesVerified : user.iscodeforcesVerified,
                iscodechefVerified : user.iscodechefVerified
            }
        });

    } catch (err) {
        console.error("Error fetching user data:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = getUserData;
