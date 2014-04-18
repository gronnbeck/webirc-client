app.factory('Connection', ['verify', function(verify) {

  function Connection(url) {

    this.connect = function(config, listeners) {
      var self = this
      , listeners = listeners || []
      , connection = config.connection

      self.send = function(message) {
        websocket.send(JSON.stringify(message))
      }

      var connect = function() {
        if (config.key != null) {
          var reconnect = {
            type: 'reconnect',
            key: config.key,
            raw: true
          }
          self.send(reconnect)
        }
        else if (verify.connection(connection)) {
          var connect = {
            type: 'connect',
            connection: connection,
            raw: true
          }
          self.send(connect)
        }
      }

      var websocket = new WebSocket(url)
      websocket.onopen = function(e) {
        connect()
      }

      websocket.onmessage = function(e) {
        var parsed = JSON.parse(e.data)
        listeners.forEach(function(listener) {
          listener(parsed)
        })
      }
      return self
    }
  }
  return Connection
}])
