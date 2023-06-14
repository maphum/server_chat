const express = require('express');
const http = require('http');
const https = require('https')
const {v4: uuidv4} = require('uuid');
const cors = require('cors');
const twilio = require('twilio');
const e = require('express');
const { makeFile, execFfmpeg, fetchData, streamMiddleWare } = require('./utils');
const fs = require('fs')
const PORT = process.env.PORT || 5002;

const SERVERURL = process.env.LIVE_SERVER_URL || "http://localhost:8080/" 

const app = express();

const options = {
}

const server = http.createServer(app);

app.use(cors());

let connectedUsers =[];
let rooms = [];
let streams = []; 



app.get('/api/room-exists/:roomId', (req, res) => {
    const {roomId} = req.params;
    const room = rooms.find(room => room.id === roomId);
    if(room){
        res.send({roomExists: true, full: false});
    }else{
        res.send({roomExists: false});
    }
})
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
});

io.on('connection', socket => {
    console.log(`user connected ${socket.id}`);
    socket.on('create-new-room', (data) => {
        createNewRoomHandler(data, socket)
    })

    socket.on('join-room', (data) => {
        joinRoomHandler(data, socket)
    }
    )
    socket.on('disconnect', () => {
        disconnectHandler(socket);
    })

    socket.on('conn-signal', data => {
        signalingHandler(data, socket);
    })

    socket.on('conn-init', data => {
        initializeConnectionHandler(data, socket);
    })

    socket.on('send-message', data => {
        const {message, roomId} = data;
        const room = rooms.find(room => room.id === roomId);
        if(!room){
            return;
        }
        room.messages.push(message);
        io.to(roomId).emit('message', {message});
    })

    socket.on('stream',(stream) => {
        console.log('stream came from host');
        socket.broadcast.emit('stream', {
            stream: stream,
            connUserSocketId: socket.id,
        });
    });

    socket.on('link-update', (data) => {
        linkUpdateHandler(data, socket);
    })

})

setInterval(async () => {
    streams = await streamMiddleWare(streams, rooms, io);
    rooms = rooms.map(room => {
        let stream = streams.find(stream => stream.name == room.id);
        stream = stream ? stream : {
            resolutions: []
        }
        return {
            ...room,
            stream,
        }
    })
}, 2000 )

const linkUpdateHandler = (data, socket) => {

    // console.log(data);
    // const {isHost, roomId, link} = data;

    // const room = rooms.find(room => room.id === roomId);

    // if (isHost) {
    //     execFfmpeg(roomId);
    //     makeFile(roomId);
    //     room.link = SERVERURL + roomId + ".m3u8"; 
    //     socket.emit('link-update', {
    //         link: room.link
    //     })
    // }
    // else {

    // }
}

const createNewRoomHandler = (data, socket) => {
    console.log('host is creating new room');                       
    const {identity} = data;
    const roomId = uuidv4();

    // create new User 
    const newUser = {
        identity,
        id: uuidv4(),
        socketId: socket.id,
        roomId,
    }

    connectedUsers.push(newUser);

    const newRoom = {
        id : roomId,
        connectedUsers: [newUser],
        messages: [],
        link: "", 
    }
    socket.join(roomId);

    rooms.push(newRoom);

    socket.emit('room-id', { roomId });

    socket.emit('user-id', {userId: newUser.id});

    socket.emit('room-update', {connectedUsers: newRoom.connectedUsers});
}

const joinRoomHandler = (data, socket) => {

    const {roomId, identity} = data;
    const room = rooms.find(room => room.id === roomId);
    socket.join(roomId);
    const newUser = {
        identity,
        id: uuidv4(),
        socketId: socket.id,
        roomId,
    }
    room.connectedUsers.push(newUser);
    connectedUsers.push(newUser);
    socket.emit('user-id', {userId: newUser.id});
    socket.emit('link-update', {resolutions: room.stream.resolutions } ); 
      // emit to all users which are already in this room to prepare peer connection
    room.connectedUsers.forEach((user) => {
        if (user.socketId !== socket.id) {
        const data = {
            connUserSocketId: socket.id,
        };    
      
        io.to(user.socketId).emit("conn-prepare", data);
    }
    });

    io.to(roomId).emit("room-update", { connectedUsers: room.connectedUsers });
}

const disconnectHandler = (socket) => {
    console.log(`user disconnected ${socket.id}`);
    const user = connectedUsers.find(user => user.socketId === socket.id);
    if(!user){
        return;
    }
    const room = rooms.find(room => room.id === user.roomId);
    if(!room){
        return;
    }
    room.connectedUsers = room.connectedUsers.filter(connectedUser => connectedUser.id !== user.id);
    connectedUsers = connectedUsers.filter(connectedUser => connectedUser.id !== user.id);
    socket.leave(user.roomId);

    if (room.connectedUsers.length > 0) {
        io.to(room.id).emit('user-disconnected', {socketId: socket.id});

        io.to(room.id).emit('room-update', {connectedUsers: room.connectedUsers});
    } else {
        rooms = rooms.filter(r => r.id !== room.id);
    }
}

const signalingHandler = (data, socket) => {
    const {connUserSocketId, signal} = data;
    const signalingData = {
        signal,
        connUserSocketId: socket.id,
    }
    io.to(connUserSocketId).emit('conn-signal', signalingData);
}

const initializeConnectionHandler = (data, socket) => {
    const {connUserSocketId} = data;

    const initData = {
        connUserSocketId: socket.id,
    }

    io.to(connUserSocketId).emit('conn-init', initData);
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
