const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const connectDB = require('./DB/db');

const port = process.env.PORT || 4000
connectDB();

app.use(cors({credentials: true}));
app.use(express.json());
app.use(cookieParser());

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

app.get('/',(req,res)=>{
    res.send('Welcome to UpCode Backend');
});