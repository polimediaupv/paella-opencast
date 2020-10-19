var express = require('express')
  , httpProxy = require('http-proxy');

var app = express();


var proxy = httpProxy.createProxyServer({secure:false});
 
function proxyFunc(req, res, next) {
	//proxy.web(req, res, { target: 'https://stable.opencast.org/' });
	proxy.web(req, res, { target: 'https://engage.videoapuntes.upv.es/', secure: false, changeOrigin: true });
	//proxy.web(req, res, { target: 'https://opencast-dev.uni-koeln.de/' });	
}


app.use('/paella/ui', express.static('target/gulp/paella-opencast'));
app.use(proxyFunc);

app.listen(4000, function () {
  console.log('Example app listening on port 3000!');
});
