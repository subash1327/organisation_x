var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

let sites = {}
let users = {}

io.on('connection', socket => {
    console.log(`connected - ${socket.id}`)
    
    socket.on('disconnect', () => {
        console.warn(`disconnected - ${socket.id}`)
    });
    socket.on('event', (data) => {
        console.log(`event - ${JSON.stringify(data)}`)
        io.emit(data.event, data.data)
    });
});

// socketApi.emit = (event, data, site) => {
//     console.log(`emit: event: ${event}`)
//     users[data.site].forEach(user => {
//         user.emit(event, data)
//     });
// }

module.exports = socketApi;