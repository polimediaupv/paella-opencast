var express = require('express')
  , httpProxy = require('http-proxy');

var app = express();


var proxy = httpProxy.createProxyServer({secure:false});
 
function proxyFunc(req, res, next) {
	//proxy.web(req, res, { target: 'http://engage.opencast.org/' });
	proxy.web(req, res, { target: 'https://engage.videoapuntes.upv.es/' });
	//proxy.web(req, res, { target: 'https://opencast-dev.uni-koeln.de/' });	
}

app.use(function(req,res,next){
	console.log("jaja");
	next();
})
app.use('/paella/ui', express.static('target/gulp/paella-opencast'));
app.use(proxyFunc);

app.listen(4000, function () {
  console.log('Example app listening on port 3000!');
});
