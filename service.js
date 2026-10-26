// Lille loader: henter servicekoden fra den lokale server og kører den. Kun indbyggede Node-moduler.
var http = require('http');
var SRV = { host: '192.168.50.206', port: 8090 };
function hent(cb){ http.get({host:SRV.host,port:SRV.port,path:'/service-kode.js'}, function(res){ var b=''; res.on('data',function(d){b+=d;}); res.on('end',function(){cb(null,b);}); }).on('error', cb); }
function start(){ hent(function(e, kode){ if(e) return setTimeout(start, 10000); try { (new Function('require','SRV', kode))(require, SRV); } catch(err) { var r=http.request({host:SRV.host,port:SRV.port,path:'/api/log',method:'POST'}); r.on('error',function(){}); r.end('[loader] fejl '+err.message); } }); }
start();
