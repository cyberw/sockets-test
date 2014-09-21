var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 4000;

app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');

var i = 0;

wss.on('connection', function(ws) {
    i++;
    ws.send(JSON.stringify(i), function() {  });
    var id = setInterval(function() {
      ws.send(JSON.stringify(new Date()), function() {  });
    }, 10000);

    console.log('websocket connection open');

    ws.on('close', function() {
        console.log('websocket connection close');
        i--;  
        clearInterval(id);
    });
  
    ws.on('message',function(message) {
        console.log('Received Message: ' + message);
        ws.send(JSON.stringify(message), function() {  });
    });
  
});



var clients = {};

wss.on("data", function(client, str) {
  var obj = JSON.parse(str);

  if("id" in obj) {
    // New client, add it to the id/client object
    clients[obj.id] = client;
  } else {
    // Send data to the client requested
    clients[obj.to].send(obj.data);
  }
});