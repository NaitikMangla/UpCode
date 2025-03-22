require('dotenv').config()

// const HOST = '127.0.0.1';
// packages
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const path = require('path');
const cors = require('cors');
const {createServer} = require('http');
const {initializeSocket} = require('./services/socket')

//routers
const playRouter = require('./router/problem')
const authRoutes = require('./router/authroutes');
const userRoutes = require('./router/userroutes');

//server initialisation
const app = express()
const server = createServer(app);
initializeSocket(server)

// view engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// database connection
const connectDB = require('./DB/db');
connectDB().then(() => {
    // app.listen(port, () => {
    //     console.log(`Server is running on port ${port}`);
    // });
}).catch(err => {
    console.error("MongoDB Connection Failed:", err);
});


// const {connectLocalDB} = require('./LocalDB_Connection/connect')
// connectLocalDB()

//middlewares
app.use(cors({
    origin: "http://localhost:5173",  // Allow frontend
    credentials: true,  // Allow cookies if needed
    methods: ["GET", "POST"],  // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"]  // Allowed headers
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//route handlers
app.get('/', (req, res)=>{res.send('Welcome to UpCode Backend')})
app.use('/problem', playRouter)
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// start server
const port = process.env.PORT || 3000
server.listen(port, ()=>{
console.log(`app started at ${process.env.PORT}`)
})
