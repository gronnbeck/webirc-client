app.factory('irc', function(Connection, IRCConnection, api, config) {
  var uri = config.uri
  return function(userId, listeners, bind) {
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
          var irc = new IRCConnection(
            parsed.server,
            parsed.nick,
            parsed.server,
            parsed.key
          )

          api.insert(irc, function() {
            console.log('inserted')
          })
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
      var connection = new Connection(uri)
      var irc = connection.connect(config, [listener])
      bind({
        send: irc.send
      })
    }

    api.all(function(all) {
      if (_.isEmpty(all)) {
        return
      }
      var connConfig = _.first(all)
      try2connect(connConfig)
    })


    api.get(userId).success(function(user) {

    })

  }


})
