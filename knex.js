'use strict';

const Knex = require('knex');

const knex = connect();

function connect(){
  let config = {pool: {}};
  config.pool.max = 5;
  config.pool.min = 5;
  config.pool.acquireTimeoutMillis = 60000;
  config.createTimeoutMillis = 30000;
  config.idleTimeoutMillis = 600000;
  config.createRetryIntervalMillis = 200;
  let knex;
  knex = connectWithUnixSockets(config);
  return knex;
}

function connectWithUnixSockets(config) {
    
  return Knex({client: 'pg',
  connection: local ? {
    host: env.env.DATABASE_HOST,
    port:  env.env.DATABASE_PORT,
    database: env.env.DATABASE_NAME,
    user:  env.env.DATABASE_USER,
    password: env.env.DATABASE_PASSWORD,
    charset: 'utf8'
  }:{
    host: env.env.DATABASE_HOST,
    port:  env.env.DATABASE_PORT,
    database: env.env.DATABASE_NAME,
    user:  env.env.DATABASE_USER,
    password: env.env.DATABASE_PASSWORD,
    charset: 'utf8',
    ssl: { rejectUnauthorized: false }
  }});
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
  knex:knex,
  select: select,
  insert: insert,
  update: update,
  count: count,
  delete2: delete2
}