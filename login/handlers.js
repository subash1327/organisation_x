// const db = require('../db')
const knex = require('../knex')
const jwt = require('jsonwebtoken')

exports.login = async (req, res) => {
    let queries = req.body.queries;
    let raw = req.body.raw;
    try {
        var query = knex.knex(req.params.name)
        if(queries){
            query = query.where(b => {
                queries.forEach(e => {
                    b.where(...e);
                });
            })
        }
        if(raw){
            query = query.whereRaw(raw)
        }
        let data = await query;
        if (data.length > 0) {
            const token = jwt.sign(data[0], env.env.JWT_KEY, { expiresIn: '3d' })
            res.send({
                'success': true,
                'message': 'Login Successfull',
                'token': token,
                'data': data[0]
            })
            return;
        } else {
            res.send({
                'success': false,
                'message': 'Login Failed'
            })
        }
    } catch (error) {
        console.log(error)
        res.send({
            'success': false,
            'message': `Login Failed: ${error}`
        })
    }
}
