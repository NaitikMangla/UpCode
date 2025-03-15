const usermodel = require('../model/usermodel');

const getUserData = async (req, res) => {
    try{
        const {userId} = req.body.userId || req.userId;
        const user = await usermodel.findById(userId);
        if(!user) return res.status(404).json({error: "User not found"});
        
        res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
            }
        })

    } catch(err){
        return res.status(500).json({error: "Internal Server Error"});
    }
}

module.exports = getUserData;