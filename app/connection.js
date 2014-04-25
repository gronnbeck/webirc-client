app.factory('Connection', ['verify', function(verify) {

  function Connection(url) {

    this.connect = function(config, onopen, onmessage) {
      var self = this
      , listeners = onmessage || []
      , onopen = onopen || []
      , connection = config.connection

      if (!_.isArray(onopen)) {
        onopen = [onopen]
      }
      
      if (!_.isArray(listeners)) {
        listeners = [listeners]
      }

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
      handleMessage = function(message) {
        listeners.forEach(function(listener) {
          listener(message)
        })
      }

      var isMessage = function(message) {
        return message.type !== 'connected'
      }

      var handleHandshake = function(message) {
        onopen.forEach(function(callback){
          callback(message, self)
        })
      }

      var isHandshake = function(message) {
        return message.type === 'connected'
      }

      websocket.onopen = function(e) {
        connect()
      }

      websocket.onmessage = function(raw) {
        var message = JSON.parse(raw.data)
        if (isMessage(message)) handleMessage(message)
        else if (isHandshake(message)) handleHandshake(message)
      }
      return self
    }
  }
  return Connection
}])
