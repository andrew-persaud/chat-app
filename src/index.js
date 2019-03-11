const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages.js')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users.js')


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '../public');


app.use(express.static(publicPath)); //Setup static directory to serve



//io.to.emit, socket.broadcast.to.emit for rooms, to is a function

io.on('connection', (socket) => {
    //occurs every new connection
    console.log('New WebSocket connection');
    

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room});

        if (error) {
            return callback(error);
        }

        socket.join(user.room)
        socket.emit('message', generateMessage(`Welcome ${username}`)); //line to the user
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the chat!`)); //line to all users minus the individual user
        io.to(user.room).emit('roomData', {
            room : user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    });

    socket.on('chatMessage', (message, callback) => {
        const user = getUser(socket.id);

        // const filter = new Filter();
        // if(filter.isProfane(message)) {
        //     return callback('Please do not use profanity');
        // }
        
        io.to(user.room).emit('message', generateMessage(user.username, message)); //line to every user
        callback('Message sent.');
    });

    socket.on('sendLocation', ({longitude, latitude}, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`));
        callback();
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
       
    })


})


server.listen(port, () => {
    console.log("Server is running on port " + port);
})