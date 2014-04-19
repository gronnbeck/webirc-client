var WebSocketServer = require('ws').Server
var mockData = require('./mock-data')

wss = new WebSocketServer({ port: 8080 })
wss.on('connection', function(ws) {

  ws.on('message', function(payload) {
    var key = 'this-is-a-mock-key'
    var send = function(message) {
      var payload = JSON.stringify(message)
      ws.send(payload)
    }
    var message = JSON.parse(payload)
    if (message.type == 'connect' || message.type == 'reconnect') {

      send({
        type: 'connected',
        key: key,
        server: 'mock-server',
        nick: 'mock-nick',
        channels: ['#chan', '#4chan']
      })
      
      mockData.forEach(function(data) {
        data[key] = key
        console.log(data)
        send(data)
      })
    }
  })

})
