'use strict';

const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');

module.exports = (server)=>{
  var dataSourceConf = path.resolve(__dirname, '../../datasources.json');
  if(!fs.existsSync(dataSourceConf)) {
    jsonfile.writeFileSync(dataSourceConf, {
      db: {
        name: "db",
        connector: "memory",
      },
    }, {spaces: 2});
  }
};
