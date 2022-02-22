'use strict';

const Knex = require('knex');
const fs = require('fs');
const path = require('path');
const knex = connect();

function connect() {
  let config = {
    "pool": {
      "min": 2,
      "max": 6,
      "createTimeoutMillis": 3000,
      "acquireTimeoutMillis": 30000,
      "idleTimeoutMillis": 30000,
      "reapIntervalMillis": 1000,
      "createRetryIntervalMillis": 100,
      "propagateCreateError": false // <- default is true, set to false
    },
  };

  // config.pool.max = 5;
  // config.pool.min = 5;
  // config.pool.acquireTimeoutMillis = 60000; 
  // config.pool.createTimeoutMillis = 30000; 
  // config.pool.idleTimeoutMillis = 600000; 
  // config.pool.createRetryIntervalMillis = 200;

  let knex;
  knex = connectWithUnixSockets(config);
  return knex;
}

function connectWithUnixSockets(config) {
  const dbSocketPath = '/cloudsql';
  return Knex({
    client: 'pg',
    connection: local ? {
      host: env.env.DATABASE_HOST,
      port: env.env.DATABASE_PORT,
      database: 'jump_db',
      user: env.env.DATABASE_USER,
      password: env.env.DATABASE_PASSWORD,
      charset: 'utf8'
    } : {
      host: env.env.DATABASE_HOST,
      port: env.env.DATABASE_PORT,
      database: 'jump_db',
      user: env.env.DATABASE_USER,
      password: env.env.DATABASE_PASSWORD,
      charset: 'utf8',
      //host: `${dbSocketPath}/organic-zephyr-325406:us-central1:postgres`,
      // ssl: {
      //   rejectUnauthorized: false,
      //   // ca: fs.readFileSync(path.join(__dirname,'server-ca.pem')), // e.g., '/path/to/my/server-ca.pem'
      //   // key: fs.readFileSync(path.join(__dirname,'client-key.pem')), // e.g. '/path/to/my/client-key.pem'
      //   // cert: fs.readFileSync(path.join(__dirname,'client-cert.pem')), // e.g. '/path/to/my/client-cert.pem'
      // },
    },
    //...config
  });
}

const insert = (table, data) => {
  return knex(table)
    .insert(data)
}

const update = (table, options = { fields: {}, conditions: [] }) => {
  const { fields, conditions } = options
  return knex(table)
    .where(builder => {
      conditions.forEach(condition => {
        builder.where(...condition)
      });
    })
    .update(fields)
    .then(data => data)
}

const count = (table, options = { fields: {}, conditions: [] }) => {
  const { fields, conditions } = options
  return knex(table)
    .count(fields)
    .where(builder => {
      conditions.forEach(condition => {
        builder.where(...condition)
      });
    }).then(data => data)
}

const select = (table, options = { fields: [], conditions: [] }) => {
  const { fields, conditions } = options

  return knex(table)
    .select(fields)
    .where(builder => {
      conditions.forEach(condition => {
        builder.where(...condition)
      });
    })
    .then(data => data)
}

const delete2 = (table, options = { conditions: [] }) => {
  const { conditions } = options
  return knex(table)
    .where(builder => {
      conditions.forEach(condition => {
        builder.where(...condition)
      });
    })
    .del()
    .then(data => data)
}

module.exports = {
  knex: knex,
  select: select,
  insert: insert,
  update: update,
  count: count,
  delete2: delete2
}