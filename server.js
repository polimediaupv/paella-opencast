var express = require('express')
  , httpProxy = require('http-proxy');

var app = express();


var proxy = httpProxy.createProxyServer({});
 
function proxyFunc(req, res, next) {
	//proxy.web(req, res, { target: 'http://engage.opencast.org/' });
	proxy.web(req, res, { target: 'http://engage.videoapuntes.upv.es:8080/' });
	
}


app.use('/paella/ui', express.static('build/paella-opencast'));
app.use(proxyFunc);


module.exports = app;