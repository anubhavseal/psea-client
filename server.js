/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var multer  = require('multer');

var _ = require('lodash');
var path = require('path');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
//process.env.NODE_ENV = 'production';
var consoleStamp = require('console-stamp');
consoleStamp(console, { pattern : "ddd dd/mm/yyyy HH:MM:ss.l", 
						metadata: function () {
							return ("[" + process.memoryUsage().rss + "]");
						},
						colors: {
							stamp: "yellow",
							label: "white",
							metadata: "green"
						} 
					});

var fs = require('fs');

/**
 * Controllers (route handlers).
 */

//Motifworks changes
var config = require('./config');
if (config.ResourceVersion != null && ('' + config.ResourceVersion).toUpperCase() === 'START_DATE_TIME') {
	var dateFormat = require('dateformat');
    var now = new Date();
	config.ResourceVersion = dateFormat(now, 'yyyymmdd');
}
console.log('ResourceVersion: ' + config.ResourceVersion);
var tagWriters = {
  css: function (url, attr) { return '<link rel="stylesheet" href="' + url + '?version=' + config.ResourceVersion + '"' + pasteAttr(attr) + ' />'; },
  js: function (url, attr) { return '<script src="' + url + '?version=' + config.ResourceVersion + '"' + pasteAttr(attr) + '></script>'; },
  noop: function (url) { return url; }
};
var pasteAttr = function (attributes) {
  return !!attributes ? ' ' + attributes : '';
};
//Motifworks changes



/**
 * Create Express server.
 */
var app = express();

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), 
          path.join(__dirname, 'public/js'),
          path.join(__dirname, 'views/')
          ],
  bundle: true,
  compress: false,
  sourceMaps: true, 
  fingerprinting: false,
  gzip:false,
  build: false, //(config.ResourceVersion != null && config.ResourceVersion != ''? {dev : false, prod: false} : null),
  buildDir: null//path.join(__dirname,'build'), //(config.ResourceVersion != null && config.ResourceVersion != '' ? "builtAssets" : null)
}, function(assets){
	if (config.ResourceVersion != null && config.ResourceVersion != '') {
		assets.options.helperContext.css = assets.helper(tagWriters.css, "css");
		assets.options.helperContext.js = assets.helper(tagWriters.js, "js");
	}
}));
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: path.join(__dirname, 'uploads') }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type', 'Content-Encoding');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
//Motifworks changes


app.use(function(req, res, next){
	var urlPart = req.url.substr(0, (req.url.indexOf('?') > 0 ? req.url.indexOf('?') : req.url.length));
	//res.setHeader('content-type', 'application/javascript');
	urlPart = urlPart.split('/');

	if (urlPart.length < 2 || urlPart[0] !== '' || urlPart[1].toLowerCase() !== 'views') {
		next();
		return;
	}

	try{
		res.render(req.url.replace('/views/', ''),{"appConfig": config});
	}catch(e){
		next();
	}
});

app.use('/sw.js', (req, res) => {
	res.sendFile(path.resolve('views/CBS/sw.js'), 0)});

app.get('/', function(req, res) {
	res.redirect(config.LoginPage || '/security/login');
});
app.get('/login', function(req, res) {
	res.redirect(config.LoginPage || '/security/login');
});

//New UI Routes
app.get('/:a?/:b?/:c?/:d?/:e?/:f?/:g?', function(req, res) {
  res.render('shared/view', {title: 'Dashboard'});
});

//Motifworks changes


/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
