var express = require('express');
var httpProxy = require('http-proxy');
var createError = require('http-errors');

var app = express();
var proxy = httpProxy.createProxyServer({
  secure:false,
  changeOrigin: true,
  target: 'http://localhost:8080'
});

 
function proxyFunc(req, res, next) {
  proxy.web(req, res,
  function(err){
    next(createError(502, err));
  });
}

app.use('/paella/ui', express.static('target/gulp/paella-opencast'));
app.use('/paella/config', express.static('etc/paella/mh_default_org'));
app.use(proxyFunc);


app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});
