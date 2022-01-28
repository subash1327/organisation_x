const express = require('express')
const http = require('http')
var bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
global.local = false
const env_path = path.join(__dirname, local ? 'config local.json' : 'config.json')
global.env = JSON.parse(fs.readFileSync(env_path))
const knex = require('./knex')
global.admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const routes = require('./routes')

const PORT = process.env.PORT || 5000

const app = express()
global.socket = require('./socket/socket');

const io = socket.io;

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/api/v1', routes)
app.use(express.static('public'))

const server = http.createServer(app)
io.attach(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });
server.listen(PORT, () => {
  console.log('Server Started')
})