// const db = require('../db')
const knex = require('../knex')
const jwt = require('jsonwebtoken')
const date = require('date-and-time')

exports.add = async (req, res) => {
    let { id, name, login, hash, role, permissions} = req.body.user
    ///TODO: encrypt hash
    let data = {
        'id': id,
        'name': name,
        'login': login,
        'hash': hash,
        'role': role,
        'site_id': req.user.site_id,
        'permissions': JSON.stringify(permissions),
    }

    let exists = await knex.count('user', {
        conditions: [
            ['id', '=', data.id]
        ]
    });
    if(exists > 0){
        await knex.update('users', {
            fields: data,
            conditions: [
                ['id', '=', data.id]
            ]
        })
        res.send({
            success: true,
            message: 'Successfully Updated',
        })
    } else {
        await knex.insert('users', data)
        res.send({
            success: true,
            message: 'Successfully Added',
        })
    }
}

exports.login = async (req, res) => {

    let stage = req.params.stage
    try {
        let data = await knex.knex('user').where((b) => {
            b.where('uname', '=', req.body.login)
            b.orWhere('mail', '=', req.body.login)
        })
        if (data.length > 0) {
            const token = jwt.sign(data[0], env.env.JWT_KEY, { expiresIn: stage === '1' ? '1d' : '1m' })

            if(stage === '1'){
                let data1 = await knex.knex('password').where((b) => {
                    b.where('uid', '=', data[0].id)
                }).orderBy('date', 'desc')

                if(data1.length > 0){
                    if(data1[0].hash === req.body.password){
                        res.send({
                            'success': true,
                            'message': 'Login Successfull',
                            'token': token,
                            'data': data[0]
                        })
                    } else {
                        res.send({
                            'success': false,
                            'message': 'Incorrect Password'
                        })
                    }
                } else {
                    res.send({
                        'success': false,
                        'message': 'Set Password'
                    })
                }
            } else {
                res.send({
                    'success': true,
                    'message': 'User Found Successfull',
                    'token': token,
                    'data': data[0]
                })
            }
        } else {
            res.send({
                'success': false,
                'message': 'Email or Username not found'
            })
        }
    } catch (error) {
        console.log(error)
        res.send({
            'success': false,
            'message': `Email or Username not found`
        })
    }
}

exports.signup = async (req, res) => {
    

    try {
        let data = req.body;
        let password = data.password;
        delete data['password']
        let result = await knex.knex('user').insert(data, 'id')
        console.log(result)
        if (result.length) {
            data['id'] = result[0]['id']
            await knex.insert('password', {'uid': data.id, 'hash': password})
            const token = jwt.sign(data, env.env.JWT_KEY, { expiresIn:  '1d' })
            res.send({
                success: true,
                message: 'Signup Successfull',
                token: token,
                data: data
            })
        } else {
            res.send({
                success: false,
                message: 'Failed Signup'
            })
        }
    } catch (e) {
        console.log(e)
        var error = ''
        if(e.message.includes('user_mail_key')) error = 'Email Already Exists'
        if(e.message.includes('user_uname_key')) error = 'Username Already Exists'
        res.send({
            success: false,
            message: 'Failed Signup',
            error: error
        })
    }
}

exports.key = async (req, res) => {
    try {
        let sites = await knex.select('sites', {
            conditions: [
                ['key', '=', req.body.key],
            ]
        })
        if (sites.length > 0) {
            let site = sites[0]
            let data = await knex.select('users', {
                conditions: [
                    ['site_id', '=', site.id],
                    ['role', '=', 'default'],
                ]
            })

            const token = jwt.sign(data[0], env.env.JWT_KEY, { expiresIn: '3d' })
            res.send({
                'success': true,
                'message': 'Login Successfull',
                'token': token
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


exports.me = async (req, res) => {
    let data = await knex.select('users', {
        conditions: [
            ['id', '=', req.user.id],
        ]
    })
    if (data.length > 0) {
        res.send({
            'success': true,
            'message': 'Successfull',
            'data': data
        })
        return;
    } else {
        res.send({
            'success': false,
            'message': 'User not found'
        })
    }
}

exports.getqr = async (req, res) => {
    let data = await knex.select('user', {
        conditions: [
            ['id', '=', '33'],
        ]
    })
    if (data.length > 0) {
        const token = jwt.sign(data[0], env.env.JWT_KEY, { expiresIn: '1m' })
        res.send({
            'success': true,
            'message': 'Successfull',
            'token': token
        })
        return;
    } else {
        res.send({
            'success': false,
            'message': 'User not found'
        })
    }
}

exports.verifyqr = async (req, res) => {
    try {
        let data = jwt.verify(req.body.token, env.env.JWT_KEY)
        if(data){
            res.send({
                'success': true,
                'message': 'Verified'
            })
        }
    } catch (e) {
        res.send({
            'success': false,
            'message': 'Failed to Verify'
        })
    }
}

exports.getJWTKey = () => {
    let salt = new Date();
    let value = date.format(salt,'YYYY/MM/DD HH:mm');
    return `${env.env.JWT_KEY}${value}`;
}

