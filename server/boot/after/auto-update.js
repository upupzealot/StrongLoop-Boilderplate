'use strict';

module.exports = (server, callback) => {
  const db = server.datasources.db;
  const autoupdate = (method) => {
    if (db.connected) {
      db[method](callback);
    } else {
      db.once('connected', () => {
        db[method](callback);
      });
    }
  };
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'develop') {
    autoupdate('automigrate');
  } else {
    autoupdate('autoupdate');
  }
};
