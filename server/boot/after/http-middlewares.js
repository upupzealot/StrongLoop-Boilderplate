'use strict';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

module.exports = (server)=>{
  server.use(bodyParser.urlencoded({extended: true}));
  
  server.use(cookieParser('***'));
};
