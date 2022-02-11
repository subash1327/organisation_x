'use strict';

const express = require('express')
const http = require('http')
var bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
global.local = false
const cluster = require("cluster");
const cpus = require("os").cpus().length;
const env_path = path.join(__dirname, local ? 'config local.json' : 'config.json')
global.env = JSON.parse(fs.readFileSync(env_path))
const knex = require('./knex')
global.admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const routes = require('./routes')
const PORT = parseInt(process.env.PORT) || 8080;
const app = express()
global.socket = require('./socket/socket');
//const redis = require('./socket/redis')
const io = socket.io;
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/api/v1', routes)
app.use(express.static('public'))
app.enable('trust proxy');
const server = http.Server(app)
io.attach(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });
  server.listen(PORT, () => {
    console.log(`Server Started`)
  })

module.exports = server;

// if (cluster.isMaster) {
//  console.log(`Number of CPUs is ${cpus}`);
//  console.log(`Master ${process.pid} is running`);

//   for (let i = 0; i < cpus; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//     console.log("Let's fork another worker!");
//     cluster.fork();
//   });
// } else {
//   const server = http.createServer(app)
//   io.attach(server, {
//       pingInterval: 10000,
//       pingTimeout: 5000,
//       cookie: false
//     });
//   server.listen(PORT, () => {
//     console.log(`Server Started`)
//   })
// }