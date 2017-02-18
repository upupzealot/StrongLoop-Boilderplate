'use strict';

module.exports = (server, callback) => {
  server.datasources.db.autoupdate(callback);
};
