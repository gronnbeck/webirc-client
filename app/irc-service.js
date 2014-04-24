app.factory('irc', function(Connection, IRCConnection, api, config) {
  var uri = config.uri
  return function(userId, listeners, bind) {
    var connection = new Connection(uri)

    var listener = function(parsed) {
        if (parsed.type == 'msg') {
          _.each(listeners, function(listen) {
            listen(parsed)
          })
        }
        if (parsed.type == 'disconnected') {

          console.log('handle reconnect')

        }
        if (parsed.type == 'connected') {
          // rethink the way we handle connection
          console.log('handle connected components')
        }
    }

    var try2connect = function(connConfig) {
      var config = {
        key: connConfig.key,
        raw: true,
        connection: {
            server: connConfig.server,
            nick: connConfig.nick,
            channels: connConfig.chans
        }
      }
      return connect(config)
    }

    var connect = function(config) {
      var irc = connection.connect(config, [listener])
      bind({
        send: irc.send
      })
    }

    api.get(userId).success(function(user) {
      if (_.has(user, 'connections')) {
        console.log('Should update a shared-state user')
        var connConfig = _.first(user.connections)
        try2connect(connConfig)
      } else {
        console.log('Handle if user does not have any connections')
      }
    })

    return {
      connect: try2connect
    }
  }


})
