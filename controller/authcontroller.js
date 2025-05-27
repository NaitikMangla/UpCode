const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usermodel = require('../model/usermodel');
const transporter = require('../services/mailservice');
const axios = require('axios');
const userAuth = require('../middleware/userauth');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const allowedDomains = ['gmail.com', 'nitkkr.ac.in', 'icloud.com'];
    const emailDomain = email.split('@')[1];
    if (!allowedDomains.includes(emailDomain)) {
        return res.status(400).json({ error: 'Only Gmail and NIT Kurukshetra emails are allowed' });
    }

    try {
        const existingUser = await usermodel.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new usermodel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ email }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' });

        const welcomeMessage = {
            from: `"UpCode Support" <${process.env.EMAIL}>`,
            to: email,
            subject: '🎉 Welcome to UpCode!',
            html: `
                <html>
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
        
                        body { 
                            font-family: 'Poppins', sans-serif; 
                            background: #f4f4f4; 
                            color: #333; 
                            text-align: center; 
                            padding: 40px 0;
                        }
        
                        .container { 
                            max-width: 450px; 
                            margin: auto; 
                            padding: 25px; 
                            border-radius: 15px; 
                            background: white; 
                            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
                            text-align: center;
                            animation: fadeIn 1.5s ease-in-out;
                        }
        
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
        
                        h2 { 
                            font-size: 24px; 
                            margin-bottom: 15px;
                            color: #007bff;
                            text-shadow: 0px 0px 10px rgba(0, 123, 255, 0.2);
                        }
        
                        .greeting {
                            font-size: 18px; 
                            color: #555; 
                            margin-bottom: 15px;
                        }
        
                        .highlight {
                            color: #ffcc00; 
                            font-weight: bold;
                        }
        
                        .footer { 
                            font-size: 12px; 
                            color: #777; 
                            margin-top: 20px; 
                        }
        
                        .btn {
                            display: inline-block;
                            margin-top: 15px;
                            padding: 12px 25px;
                            background: #007bff;
                            color: white;
                            font-weight: bold;
                            border-radius: 8px;
                            text-decoration: none;
                            transition: 0.3s;
                            box-shadow: 0px 0px 10px rgba(0, 123, 255, 0.2);
                        }
        
                        .btn:hover {
                            background: #0056b3;
                            transform: scale(1.05);
                            box-shadow: 0px 0px 15px rgba(0, 86, 179, 0.5);
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>🎉 Welcome to UpCode, ${name}!</h2>
                        <p class="greeting">We're excited to have you on board. UpCode is here to make your coding journey <span class="highlight">amazing</span>! 🚀</p>
                        <p>Start exploring, solving challenges, and growing as a developer with us.</p>
                        <a href="${process.env.FRONTEND_URL}" class="btn">Explore UpCode</a>
                        <div class="footer">
                            <p>Happy coding! 🔥</p>
                            <p><strong>UpCode Team</strong></p>
                            <p>If you didn’t sign up, you can ignore this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };


        transporter.sendMail(welcomeMessage)
            .then(() => { console.log("Message sent!") })
            .catch(() => { console.log("Some error occured") });
        console.log('Registered!')
        return res.status(202).json({ message: "successfull registration" });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    // console.log("logging...")
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields are required' });

    try {
        const user = await usermodel.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' });

        return res.json({ message: 'Login successful' });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token', { path: '/' });
    // req.userData.isAccountVerified = true;
    return res.json({ message: 'Logged out successfully', success: "true" });
};

const sendverifyOTP = async (req, res) => {
    try {
        // const user = await usermodel.findOne(req.email);

        // console.log('User:', user);

        if (req.userData.isAccountVerified) return res.status(200).json({ message: 'Account already verified' });

        const otp = Math.floor(100000 + Math.random() * 900000);
        req.userData.verifyOTP = otp;
        req.userData.verifyOTPExpireAt = Date.now() + 600000; // 10 minutes
        await req.userData.save();

        // console.log('Generated OTP:', otp);

        const verifyMessage = {
            from: `"UpCode Support" <${process.env.EMAIL}>`,
            to: req.userData.email,
            subject: '🔐 Verify Your UpCode Account',
            html: `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                        .otp { font-size: 22px; font-weight: bold; color: #007bff; }
                        .footer { font-size: 12px; color: #666; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>🔒 Verify Your UpCode Account</h2>
                        <p>Dear <strong>${req.userData.name}</strong>,</p>
                        <p>Your One-Time Password (OTP) for account verification is:</p>
                        <p class="otp">${otp}</p>
                        <p>Please enter this OTP within the next <strong>10 minutes</strong>.</p>
                        <p>If you didn’t request this, please ignore this email.</p>
                        <div class="footer">
                            <p>Thanks,</p>
                            <p><strong>UpCode Team</strong></p>
                            <p>If you don't want to receive such emails, <a href="#">unsubscribe</a>.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const sendMailPromise = require('util').promisify(transporter.sendMail.bind(transporter));
        await sendMailPromise(verifyMessage);

        // console.log("Verify OTP sent successfully");
        return res.json({ message: "Verification OTP sent successfully", success: "true" });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const verifyemail = async (req, res) => {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP is required' });

    // console.log('OTP:', otp);
    console.log('req Body', req.body);

    try {
        // const user = await usermodel.findById(req.userId);
        if (req.userData.isAccountVerified) return res.status(400).json({ error: 'Account already verified' });

        if (Number(req.userData.verifyOTP) !== Number(otp)) return res.status(400).json({ error: 'Invalid OTP', message: 'verification failed' });

        if (Date.now() > req.userData.verifyOTPExpireAt) return res.status(400).json({ error: 'OTP expired' });

        req.userData.verifyOTP = '';
        req.userData.verifyOTPExpireAt = 0;
        req.userData.isAccountVerified = true;
        await req.userData.save();

        return res.status(200).json({ message: 'Account verified successfully', success: "true" });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const isAuthenticated = async (req, res) => {
    try{
        return res.status(200).json({ success: true});
    } catch(err){
        return res.status(500).json({ error: 'Internal server error'});
    }
}

const sendResetOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const user = await usermodel.findOne({ email: email });
        if (!user) return res.status(400).json({ error: 'User not found' });
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.resetOTP = otp;
        user.resetOTPExpireAt = Date.now() + 600000; // 10 minutes
        const token = jwt.sign({ email }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' });
        await user.save();

        const resetMessage = {
            from: `"UpCode Support" <${process.env.EMAIL}>`,
            to: user.email,
            subject: '🔐 Reset Your UpCode Password',
            html: `
                <html>
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
        
                        body { 
                            font-family: 'Poppins', sans-serif; 
                            background: linear-gradient(135deg, #141e30, #243b55); 
                            color: #ffffff; 
                            text-align: center; 
                            padding: 40px 0;
                        }
        
                        .wrapper {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                        }
        
                        .container { 
                            max-width: 450px; 
                            padding: 25px; 
                            border-radius: 15px; 
                            background: rgba(255, 255, 255, 0.1); 
                            backdrop-filter: blur(10px); 
                            box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
                            text-align: center;
                            animation: fadeIn 1.5s ease-in-out;
                        }
        
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
        
                        h2 { 
                            font-size: 24px; 
                            margin-bottom: 15px;
                            color: #ffcc00;
                            text-shadow: 0px 0px 10px rgba(255, 204, 0, 0.8);
                        }
        
                        .code { 
                            font-size: 32px; 
                            font-weight: bold; 
                            color: #00d4ff; 
                            text-shadow: 0px 0px 15px rgba(0, 212, 255, 1);
                            letter-spacing: 5px;
                            animation: glow 1.5s infinite alternate;
                        }
        
                        @keyframes glow {
                            from { text-shadow: 0px 0px 10px rgba(0, 212, 255, 0.8); }
                            to { text-shadow: 0px 0px 20px rgba(0, 212, 255, 1); }
                        }
        
                        .footer { 
                            font-size: 12px; 
                            color: #ccc; 
                            margin-top: 20px; 
                        }
        
                        .footer a { 
                            color: #ffcc00; 
                            text-decoration: none;
                        }
        
                        .footer a:hover { 
                            text-decoration: underline;
                        }
        
                        .btn {
                            display: inline-block;
                            margin-top: 15px;
                            padding: 12px 25px;
                            background: #00d4ff;
                            color: #141e30;
                            font-weight: bold;
                            border-radius: 8px;
                            text-decoration: none;
                            transition: 0.3s;
                            box-shadow: 0px 0px 10px rgba(0, 212, 255, 0.8);
                        }
        
                        .btn:hover {
                            background: #ffcc00;
                            color: #000;
                            transform: scale(1.05);
                            box-shadow: 0px 0px 15px rgba(255, 204, 0, 0.8);
                        }
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="container">
                            <h2>🔐 Reset Your Password</h2>
                            <p>Dear <strong>${user.name}</strong>,</p>
                            <p>You requested to reset your password. Use the code below to proceed:</p>
                            <p class="code">${otp}</p>
                            <p>The code is valid for <strong>10 minutes</strong>.</p>
                            <p>If you didn’t request this, please ignore this email.</p>
                            <a href="${process.env.FRONTEND_URL}/reset-password?email=${user.email}" class="btn">Reset Password</a>
                            <div class="footer">
                                <p>Thanks,</p>
                                <p><strong>UpCode Team</strong></p>
                                <p>If you didn't request this, please contact our support.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        await transporter.sendMail(resetMessage, (err, info) => {
            if (err) {
                console.error("Email sending failed:", err); // 🛠️ Log full error
                return res.status(500).json({ error: "Failed to send OTP", details: err });
            } else {
                console.log("Reset OTP sent successfully:", info.response);
                return res.json({ message: "Reset OTP sent successfully" });
            }
        })

        return res.json({ message: 'Reset OTP sent successfully', success: "true" });

    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const resetPassword = async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'All fields are required' });
    // const {email, otp, password} = req.body;
    // if(!email || !otp || !password) return res.status(400).json({error: 'All fields are required'});

    try {
        const user = await usermodel.findOne({ email: req.userData.email });
        if (!user) return res.status(400).json({ error: 'User not found' });
        // if(Number(user.resetOTP) !== Number(otp)) return res.status(400).json({error: 'Invalid OTP'});
        // if(Date.now() > user.resetOTPExpireAt) return res.status(400).json({error: 'OTP expired'});
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetOTP = '';
        user.resetOTPExpireAt = 0;
        await user.save();

        return res.json({ message: 'Password reset successfully', success: "true" });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const verify_platforms_id = async (req, res) => {
    const { leetcode_id, gfg_id, codeforces_id, codechef_id } = req.body;
    if (!leetcode_id && !gfg_id && !codeforces_id && !codechef_id) return res.status(400).json({ error: 'At least one platform ID is required' });

    try {
        const user = req.userData;
        user.leetcode_id = "";
        user.gfg_id = "";
        user.codeforces_id = "";
        user.codechef_id = "";
        // console.log("User Data:", user);

        if (!user) return res.status(400).json({ error: 'User not found' });

        if (leetcode_id) {
            user.leetcode_id = leetcode_id;
            user.leetcode_status = 0;
        }
        if (gfg_id) {
            user.gfg_id = gfg_id;
            user.gfg_status = 0;
        }
        if (codeforces_id) {
            user.codeforces_id = codeforces_id;
            user.codeforces_status = 0;
        }
        if (codechef_id) {
            user.codechef_id = codechef_id;
            user.codechef_status = 0;
        }

        await user.save();
        // console.log("User Data after saving:", user);
        // console.log("User Data after saving:", user);
        const data = {
            name: user.name,
            email: user.email,
            leetcode_id: user.leetcode_id,
            gfg_id: user.gfg_id,
            codeforces_id: user.codeforces_id,
            codechef_id: user.codechef_id,
        };

        const requests = await new requestModel(data).save();
        if (!requests) return res.status(400).json({ error: 'Failed to create request' });

        return res.json({ data: requests, success: true, message: "Request sent successfully" });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const get_all_requests = async (req, res) => {
    try {
        const requests = await requestModel.find({});
        if (!requests) return res.status(400).json({ error: 'Failed to fetch requests' });

        return res.json({ data: requests, success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const verify_LC = async (req, res) => {
    const { id, token } = req.body;

    if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "Invalid username" });
    }

    console.log(`Verifying LeetCode user: ${id} with token: ${token}`);

    setTimeout(async () => {
        try {
            const query = {
                query: `
          query userPublicProfile($id: String!) {
            matchedUser(username: $id) {
              profile {
                realName
              }
            }
          }
        `,
                variables: { id }
            };

            const headers = {
                "Content-Type": "application/json",
                "Referer": `https://leetcode.com/u/${id}/`
            };

            const response = await axios.post("https://leetcode.com/graphql/", query, { headers });

            const realName = response.data?.data?.matchedUser?.profile?.realName || "";

            if (realName === token) {
                req.userData.isleetcodeVerified = true;
                req.userData.leetcode_status = 1;
                req.userData.leetcode_id = id;
                return res.status(200).json({ success: true, message: "User verified successfully" });
            } else {
                console.log(`Not Verified: Expected ${token}, got ${realName}`);
            }
        } catch (error) {
            console.error("Error verifying LeetCode user:", error.response?.data || error.message);
        }
    }, 90000);
};


const verify_CF = async (req, res) => {
    const { id, token } = req.body;

    if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "Invalid username" });
    }

    console.log(`Verifying Codeforces user: ${id} with token: ${token}`);

    setTimeout(async () => {
        try {
            const response = await axios.get(`https://codeforces.com/api/user.info?handles=${id}`);
            const userData = response.data.result[0];

            if (userData && userData.lastName === token) {
                req.userData.iscodeforcesVerified = true;
                req.userData.codeforces_status = 1;
                req.userData.codeforces_id = id;
                return res.status(200).json({ success: true, message: "User verified successfully" });
            } else {
                console.log(`Not Verified: Expected ${token}, got ${userData?.firstName}`);
            }
        } catch (error) {
            console.error("Error verifying Codeforces user:", error.response?.data || error.message);
        }
    }, 90000);
};

const verify_CC = async (req, res) => {
    const { id, token } = req.body;

    if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "Invalid username" });
    }

    console.log(`Verifying CodeChef user: ${id} with token: ${token}`);

    setTimeout(async () => {
        try {
            const response = await axios.get(`https://codechef-api.vercel.app/handle/${id}`);
            const name = response.data.name;

            if (name && name.toLowerCase() === token.toLowerCase()) {
                req.userData.iscodechefVerified = true;
                req.userData.codechef_status = 1;
                req.userData.codechef_id = id;
                return res.status(200).json({ success: true, message: "User verified successfully" });
            } else {
                console.log(`Not Verified: Expected ${token}, got ${name}`);
            }
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }

    }, 90000);
};


const verify_GFG = async (req, res) => {
    const { id, token } = req.body;

    if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "Invalid username" });
    }

    console.log(`Verifying GFG user: ${id} with token: ${token}`);

    setTimeout(async () => {
        try {
            const url = `https://authapi.geeksforgeeks.org/api-get/user-profile-info/?handle={user}&article_count=false&redirect=true`;
            const response = await axios.get(url.replace("{user}", id));
            const userData = response.data;

            if (userData.data.name === token) {
                req.userData.isgfgVerified = true;
                req.userData.gfg_status = 1;
                req.userData.gfg_id = id;
                return res.status(200).json({ success: true, message: "User verified successfully" });
            } else {
                console.log(`Not Verified: Expected ${token}, got ${userData?.name}`);
                return res.status(400).json({ success: false, message: "User verification failed" });
            }
        } catch (error) {
            console.error("Error verifying GFG user:", error.response?.data || error.message);
        }
    }, 90000);
}
module.exports = { register, login, logout, sendverifyOTP, verifyemail, isAuthenticated, sendResetOTP, resetPassword, verify_platforms_id, get_all_requests, verify_LC, verify_CF, verify_CC, verify_GFG };
