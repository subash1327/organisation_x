const express = require('express');
const router = express.Router();
const handlers = require('./handlers')
const user = require('./user/routes')
const login = require('./login/routes')
const check = require('./middlewares/check_token')
const fs = require('fs')
const path = require('path')
const Multer = require('multer')

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
  });
router.post( '/upload/:path' , multer.single('file'), handlers.upload )
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