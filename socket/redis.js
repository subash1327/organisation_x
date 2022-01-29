var redis = require('redis');
const redisPort = 17916
const redisHostname = 'redis-17916.c1.asia-northeast1-1.gce.cloud.redislabs.com'
const password = 'f33QWGyY3sy5uPcapDoqlFQwVX198sog'
//io.adapter(redis({ host: 'redis-17916.c1.asia-northeast1-1.gce.cloud.redislabs.com', port: 17916, key: 'A13erquuh7y34bll7mmuxa3df549vc3u1r4qinx59pd0d62n8om'}));

var p1 = new Promise((resolve, reject)=>{
    var client = redis.createClient(redisPort, redisHostname, { auth_pass: password });
    client.auth(password)
    client.on('ready', ()=>{
        resolve(client)
    })
})

var p2 = new Promise((resolve, reject)=>{
    var redisSubscriber = redis.createClient(redisPort, redisHostname, { auth_pass: password });
    redisSubscriber.auth(password)
    redisSubscriber.on('ready', ()=>{
        resolve(redisSubscriber)
    })
})

Promise.all([p1,p2]).then(([client, redisSubscriber])=>{
    console.log('done', client)
    client.ping((err, data)=>{
        console.log('err, data', err, data)
    })

    // Create and use a Socket.IO Redis store
    var RedisStore = require('socket.io-redis');
    socket.io.adapter(new RedisStore({
        redisPub: client,
        redisSub: redisSubscriber,
        redisClient: client
    }));
})