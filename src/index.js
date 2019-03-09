const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '../public');


app.use(express.static(publicPath)); //Setup static directory to serve



let message = "A new user has joined the chat!";

io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    socket.emit('message', 'Welcome!');
    socket.broadcast.emit('message', message);

    socket.on('chatMessage', (message) => {
        io.emit('message', message);
    });

    socket.on('sendLocation', ({longitude, latitude}) => {
        io.emit('message', `https://google.com/maps?q=${latitude},${longitude}`);
    })


    socket.on('disconnect', () => {
        io.emit('message', 'A user has left.');
    })


})


server.listen(port, () => {
    console.log("Server is running on port " + port);
})