const express = require('express');
const router = express.Router();
const handlers = require('./handlers')
const user = require('./user/routes')
const login = require('./login/routes')
const check = require('./middlewares/check_token')
const fs = require('fs')
const path = require('path')
const multer  = require('multer')

var bucket = multer.diskStorage({
    destination: (req, file, cb) => {
        var storagePath = './bucket/';
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath);
        }
        cb(null, storagePath);
    },
    filename: (req, file, cb) => {
        cb(null,  Date.now() + file.originalname);
    }
});
const storage_bucket = multer({ storage: bucket });
router.post( '/upload' , storage_bucket.single('file'), handlers.upload )
router.get( '/download/:file', handlers.download )
router.use('/user', user)
router.use('/login', login)
router.post('/send_notification', handlers.send_notification)
router.post('/get/:name', handlers.get)
router.post('/add/:name', handlers.add)
router.post('/body_test', handlers.body_test)
router.post('/update/:name', handlers.update)
router.post('/delete/:name', handlers.delete)
router.get('/lang/:code',  handlers.lang)
setInterval(handlers.timer10, 600000);

module.exports = router;