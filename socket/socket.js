const socket_io = require('socket.io');
const io = socket_io();
const knex = require('../knex')
const socketApi = {};


socketApi.io = io;

let sites = {}
let users = {}

io.on('connection', socket => {
    console.log(`${process.pid} - connected - ${socket.id}`)
    
    socket.on('disconnect', () => {
        console.warn(`disconnected - ${socket.id}`)
        let data = users[socket.id]
        if(data){
            io.emit(`org::${data.org.id}::offline`, data.user)
            knex.update('con_stat', {
                fields: {
                    alive: false,
                    date: 'NOW()'
                },
                conditions: [
                    ['uid', '=', data.user.id]
                ]
            })
            delete users[socket.id];
        }
        
    });
    
    socket.on('online', async (j) => {
        console.log(j)
        let data = JSON.parse(j)
        console.log(data)
        users[socket.id] = data
        io.emit(`org::${data.org.id}::online`, data.user)
        try {
            knex.update('con_stat', {
                fields: {
                    alive: true,
                    date: 'NOW()'
                },
                conditions: [
                    ['uid', '=', data.user.id]
                ]
            })
        } catch (e) {
            knex.insert('con_stat', {
                uid: data.user.id,
                oid: data.org.id
            })
        }
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