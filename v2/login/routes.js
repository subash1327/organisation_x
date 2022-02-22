const express = require('express');
const router = express.Router();
const handlers = require('./handlers')
const check = require('../middlewares/check_token')

router.post('/:name', handlers.login)

module.exports = router;