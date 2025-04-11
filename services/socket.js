const { Server } = require('socket.io');
const {handleSubmission} = require('../controller/problem')

let io;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
        }
    });

    io.on('connect', (socket) => {
        console.log("Connection made with:", socket.id);
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
        
        socket.on('codeSubmission', (data)=>{handleSubmission(data, socket)})
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