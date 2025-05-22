const { Server } = require('socket.io');
const {handleRun} = require('../controller/problem')
const problemModel = require('../model/problem');
const Judge = require('./Judge')

let io = null;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL, // Allow frontend
        }
    });

    io.on('connect', (socket) => {
        console.log("Socket " + socket.id + " connected");
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
        
        socket.on('runCode', async (data)=>{
            await handleRun(data, socket)
        })

        socket.on('submitCode',async (data)=>{
            const problemData = await problemModel.findOne({id:data.problemID})

            if(!problemData)
            {
                socket.emit("error", {error : "Couldn't fetch problem data for final verdict"})
            }

            const judge = new Judge(socket, problemData, data.lang, data.srccode)
            judge.resume()
        })
    });

    return io;
}

function getIo() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { initializeSocket, getIo };