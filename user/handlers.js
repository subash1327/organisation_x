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
    try {
        let data = await knex.select('member_view', {
            conditions: [
                ['phone', '=', req.body.phone],
                ['code', '=', req.body.code],
            ]
        })
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

