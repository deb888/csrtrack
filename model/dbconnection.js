var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'csrtrack.openclouds.in',
  user     : 'csrtrack',
  password : 'csr2018',
  database : 'csrtrack'
});

try {
	connection.connect();
  console.log('Connected to the MYSQL database');

} catch(e) {
	console.log('Database Connetion failed:' + e);
}

module.exports = connection;
