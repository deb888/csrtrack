// get all the tools needed
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session  = require('express-session');
var morgan = require('morgan');
var app = express();
var port     = process.env.PORT || 5555;
var passport = require('passport');
var flash    = require('connect-flash');
var fs = require('fs');
var https = require('https');
var api = require('./api.js');
var config = require('./config');
// config passport and connect to DB
require('./config/passport')(passport);

// set up express
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.all('/*', function(req, res, next) {
	// CORS headers
	res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	// Set custom headers for CORS
	res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
	next();
  });
  
// config passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Set Https certificate
var options = {
  key: fs.readFileSync('privateKey.key'),
  cert: fs.readFileSync('certificate.crt')
};

const SERVER_SECRET = 'ohgodpleasenobug';

// routes
require('./app/routes.js')(app, passport, SERVER_SECRET); // load our routes and pass in our app and fully configured passport
app.use('/api', api);
// Create server
https.createServer(options, app).listen(port, function(){
	console.log('Server listening on port ' + port);
});
