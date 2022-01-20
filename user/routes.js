const express = require('express');
const router = express.Router();
const handlers = require('./handlers')
const check = require('../middlewares/check_token')

router.post('/add',check ,handlers.add)
router.get('/me',check, handlers.me)
router.post('/login', handlers.login)
//router.post('/login_with_email', handlers.login_with_email)
router.post('/key', handlers.key)

module.exports = router;