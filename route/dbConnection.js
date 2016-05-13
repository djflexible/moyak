
var mysql = require('mysql');

var dbConfig = {
   host: '***.c9uxminr0qga.ap-northeast-1.rds.amazonaws.com',
   user: 'admin',
   password: '***',
   //port: 3307,
   database: 'moyak',
   insecureAuth: true
};

var pool = mysql.createPool(dbConfig);

module.exports = pool;
