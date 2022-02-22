const express = require('express');
const router = express.Router();
const handlers = require('./handlers')
const check = require('../middlewares/check_token')

router.post('/add',check ,handlers.add)
router.post('/getqr', handlers.getqr)
router.post('/verifyqr', handlers.verifyqr)
router.get('/me',check, handlers.me)
router.post('/login/:stage', handlers.login)
router.post('/signup/:stage', handlers.signup)
//router.post('/signup', handlers.signup)
//router.post('/login_with_email', handlers.login_with_email)
router.post('/key', handlers.key)

module.exports = router;