// Baggrundsservice i TizenBrew. Henter sine opgaver fra den lokale server og sender svar tilbage.
var fetch = require('node-fetch');
var adbhost = require('adbhost');
var fs = require('fs');
var SRV = 'http://192.168.50.206:8090';
function log(m){ fetch(SRV+'/api/log',{method:'POST',body:'[service] '+m}).catch(function(){}); }
function sdb(cmdline, cb){
  var c = adbhost.createConnection({host:'127.0.0.1', port:26101}); var out='';
  c._stream.on('error', function(e){ cb('ERR '+e); });
  c._stream.on('connect', function(){
    var s = c.createStream('shell:' + cmdline);
    s.on('data', function(d){ out += d.toString(); });
    s.on('end', function(){ cb(out); try{ c._stream.end(); }catch(e){} });
    setTimeout(function(){ cb(out+' [timeout]'); cb=function(){}; try{ c._stream.end(); }catch(e){} }, 8000);
  });
}
function readf(p){ try { return fs.readFileSync(p,'utf8'); } catch(e){ return 'READERR '+e.message; } }
function poll(){
  fetch(SRV+'/api/opgave').then(function(r){return r.json();}).then(function(o){
    if(!o || !o.id) return;
    var done = function(res){ fetch(SRV+'/api/svar',{method:'POST',body:JSON.stringify({id:o.id,svar:res})}).catch(function(){}); };
    if(o.type==='sdb') sdb(o.cmd, done);
    else if(o.type==='read') done(readf(o.path));
  }).catch(function(){});
}
log('service startet, node '+process.version);
setInterval(poll, 2000);
