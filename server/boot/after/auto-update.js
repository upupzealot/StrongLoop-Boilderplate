'use strict';

const loopback = require('loopback');

module.exports = (server, callback)=>{
  server.datasources.db.autoupdate(callback);
};
