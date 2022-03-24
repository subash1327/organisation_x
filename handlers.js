const knex = require('./knex')
let Country = require('country-state-city').Country;
let State = require('country-state-city').State;
let City = require('country-state-city').City;

const nodemailer = require('nodemailer')
const Storage = require('@google-cloud/storage').Storage;
const storage = new Storage();
const bucket = storage.bucket('fiosource');

exports.get = async (req, res) => {
    let { order_by, order, search_by, search, limit, offset, queries, raw, fields, join, joins, country, state } = req.body
    let table = req.params.name

    if (table === 'country') {
        let c = await Country.getAllCountries()
        res.send({
            success: true,
            message: 'Successfully fetched',
            data: c
        })
        return;
    }
    if (table === 'state') {
        let c = await State.getStatesOfCountry(country)
        res.send({
            success: true,
            message: 'Successfully fetched',
            data: c
        })
        return;
    }

    if (table === 'city') {
        let c = await City.getCitiesOfState(country, state)
        res.send({
            success: true,
            message: 'Successfully fetched',
            data: c
        })
        return;
    }

    let query = knex.knex(table)

    if (joins)
        query = query.join(join,
            b => {
                joins.forEach(e => {
                    let ee = [];
                    e.forEach(f => {
                        if (typeof f === "string") {
                            ee.push(f)
                        } else {
                            ee.push(knex.knex.raw('?', f))
                        }
                    })
                    b.on(...ee);
                });
            }
        )

    if (fields)
        query = query.select(...fields)
    else
        query = query.select('*')

    if (queries) {
        query = query.where(b => {
            queries.forEach(e => {
                b.where(...e);
            });
        })

    }

    if (raw) {
        query = query.whereRaw(raw)
    }

    if (search && search_by) {
        query = query.where(b => {
            b.where(search_by, 'like', `%${search}%`)
        })
    }
    if (order_by) {
        query = query.orderBy(order_by, order)
    }
    try {
        let data = await query.limit(limit || 1000).offset(offset || 0)
        res.send({
            success: true,
            message: 'Successfully fetched',
            data: data
        })
    } catch (error) {
        console.log(error)
        res.send({
            success: false,
            message: 'Failed',
        })
    }

}


exports.add = async (req, res) => {
    let data = req.body.data
    let table = req.params.name
    delete data['id']
    try {
        let result = await knex.knex(table).insert(data, 'id')
        console.log(result)
        if (result.length) {
            res.send({
                success: true,
                message: 'Successfully Added',
                id: result[0]['id']
            })
        } else {
            res.send({
                success: false,
                message: 'Failed to Add'
            })
        }
    } catch (e) {
        console.log(e)
        res.send({
            success: false,
            message: 'Failed to Add'
        })
    }
}

exports.update = async (req, res) => {
    let data = req.body.data
    let queries = req.body.queries
    let table = req.params.name
    try {
        var result;

        if (data.id) {
            result = await knex.knex(table).update(data, 'id').where((q) => q.where('id', '=', data.id))
        } else if (queries) {
            result = await knex.knex(table).update(data, 'id').where(b => {
                queries.forEach(e => {
                    b.where(...e);
                });
            })
        }
        console.log(result)
        if (result.length) {
            res.send({
                success: true,
                message: 'Successfully Updated',
                id: result[0]['id']
            })
        } else {
            res.send({
                success: false,
                message: 'Failed to Update'
            })
        }
    } catch (e) {
        console.log(e)
        res.send({
            success: false,
            message: 'Failed to Update'
        })
    }
}

exports.timer10 = async () => {
    let start = await knex.select('shift_start_view')
    if (start) {
        let tokens = []
        start.forEach((e) => { tokens.push(e.token) })
        this.send_notification({
            body: {
                token: tokens,
                title: 'Your shift is going to Start',
                body: 'Your shift is going to Start, Tap to open the App'
            }
        }, {
            send: (r) => {
                console.log(r)
            }
        })
    }
    let end = await knex.select('shift_end_view')
    console.log(end)
}

exports.send_notification = (req, res) => {
    const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };

    const token = req.body.token
    const message = {
        notification: {
            title: req.body.title,
            body: req.body.body
        }
    }
    const options = notification_options

    try {
        admin.messaging().sendToDevice(token, message, options)
            .then(response => {
                res.send({
                    'success': true,
                    'message': 'Successfully Sent',
                })
            })
    } catch (error) {
        res.send({
            success: false,
            message: 'Failed to Send',
            error: error.message
        })
    }

}


exports.mail = async (req, res) => {
    let transporter = nodemailer.createTransport(req.body.transporter);
    // {service: 'gmail',
    // auth: {
    //   user: process.env.REACT_APP_EMAIL,
    //   pass: process.env.REACT_APP_EMAIL_PASS,
    // },}
    //   let mailOptions = {
    //     from: 'myemail@gmail.com',
    //     to: "receiver@example.com",
    //     subject: `The subject goes here`,
    //     html: `The body of the email goes here in HTML`,
    //     attachments: [
    //       {
    //         filename: `${name}.pdf`,
    //         path: path.join(__dirname, `../../src/assets/books/${name}.pdf`),
    //         contentType: 'application/pdf',
    //       },
    //     ],
    //   };
      
      transporter.sendMail(req.body.options, function (err, info) {
        if (err) {
            res.send({
                success: false,
                message: 'Failed to Send',
                error: JSON.stringify(err)
            })
        } else {
            res.send({
                success: false,
                message: 'Sent Successfully'
            })
        }
      });
}

exports.delete = async (req, res) => {
    let data = req.body.data
    let queries = req.body.queries
    let table = req.params.name
    try {
        if (data.id) {
            let result = await knex.knex(table).delete().where((q) => q.where('id', '=', data.id))
        } else if (queries) {
            let result = await knex.knex(table).delete().where(b => {
                queries.forEach(e => {
                    b.where(...e);
                });
            })
        }

        res.send({
            success: true,
            message: 'Successfully Deleted',
        })
    } catch (e) {
        console.log(e)
        res.send({
            success: false,
            message: 'Failed to Delete'
        })
    }
}



exports.upload = (req, res) => {
    try {
        if (!req.file) {
            res.send({
                'success': false,
                'message': 'Failed Uploaded',
            })
            return;
        }
    
        console.log(req.file.originalname)
        console.log(req.file.filename)
        console.log(req.params.path)
    
        const blob = bucket.file(`${req.params.path || ''}/${req.file.originalname}`);
        const blobStream = blob.createWriteStream();
    
        blobStream.on('error', err => {
            console.log('error upload')
            next(err);
        });
    
        blobStream.on('finish', () => {
            console.log('finish upload')
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`

            console.log(`url: ${publicUrl}`)
            res.send({
                'success': true,
                'message': 'Successfully Uploaded',
                'url': publicUrl
            })
        });
    
        blobStream.end(req.file.buffer);
    } catch (error) {
        console.log(error)
        res.send({
            'success': false,
            'message': `Failed Uploaded ${error.message}`,
        })
    }
}

exports.body_test = (req, res) => {
    console.log('body test')
    console.log(res.body)
}
exports.download = (req, res) => {
    res.download(`./bucket/${req.params.file}`)
}

exports.lang = (req, res) => {
    res.send({});
    // let code = req.params.code;
    // db.query(`SELECT  json_build_object(l.key, l.data::json#>'{${code}}') as data  FROM localizations as l;`, (error, result) => {
    //     if (!error) {
    //         let locales = {};
    //         result.rows.forEach((e) => {
    //             let k = Object.keys(e.data)[0];
    //             locales[k] = e.data[k]
    //         })
    //         res.send(locales)
    //     } else {
    //         console.log(error)
    //     }
    // })
}
