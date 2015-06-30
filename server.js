var express = require('express')
  , httpProxy = require('http-proxy');

var app = express();


var proxy = httpProxy.createProxyServer({});
 
function proxyFunc(req, res, next) {
	//proxy.web(req, res, { target: 'http://engage.opencast.org/' });
	// proxy.web(req, res, { target: 'http://videoapuntes-engage.upv.es:8989/' });
	proxy.web(req, res, { target: 'http://mhtest.virtuos.uos.de/' });
	
}
app.use(proxyFunc);


module.exports = app;