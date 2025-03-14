require('dotenv').config()
// packages
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const path = require('path');
const cors = require('cors');
const {createServer} = require('http');
const {initializeSocket} = require('./socket')

//routers
const playRouter = require('./router/problem')

//server initialisation
const app = express()
const server = createServer(app);
initializeSocket(server)

// view engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// database connection
// mongoose.connect(process.env.db_url)
// .then(()=>{console.log("Database connected")}).catch((err)=>{console.log(err.message)})

//middlewares
app.use(cors());
app.use(express.json()); // Add this line
app.use(express.urlencoded({extended : false}))
app.use(cookieParser())

//route handlers
app.use('/problem', playRouter)
app.get('/', (req, res)=>{res.send('hello')})

// start server
const port = process.env.PORT || 3000
server.listen(port, ()=>{
console.log(`app started at ${process.env.PORT}`)
})