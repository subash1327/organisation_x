const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        let token = req.headers.token;
        let user = jwt.verify(token, env.env.JWT_KEY)
        req.user = user;
        next();
    } catch (e) {
        res.send({
            'success': false,
            'message': 'Unauthorized'
        })
    }
}

