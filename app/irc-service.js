app.factory('IRCContainer', function(irc) {
  var map = {}
  return {
    get: function(userId, onopen, listeners) {
      if (_.has(map, userId)) {
        var connection = map[userId].connection
        onopen(map[userId].irc, map[userId].info)
        connection.rewind(listeners)
        return connection
      }
      else {
        var connection = irc(userId, listeners)
        connection.connect(function(ircConnection, info) {
          onopen(ircConnection, info)
          map[userId] = {
            connection: connection,
            irc: ircConnection,
            info: info
          }
        })

        return connection
      }
    }
  }
})

app.factory('irc', function(Connection, IRCConnection, api, config) {
  var uri = config.uri

  return function(userId, listeners) {

    var logs = []

    var pushMessage = function(message) {
      _.each(listeners, function(listen) {
        listen(message)
      })
    }

    var listener = function(message) {
        if (message.type == 'msg') {
          logs.push(message)
          pushMessage(message)
        }
        if (message.type == 'disconnected') {
          console.log('handle reconnect')
        }
    }

    var connect = function(callback) {

      var connection = new Connection(uri)
      api.get(userId).success(function(user) {

        if (_.has(user, 'connections')) {
          console.log('Should update a shared-state user')
          var connConfig = _.first(user.connections)

          var config = {
            key: connConfig.key,
            raw: true,
            connection: {
                server: connConfig.server,
                nick: connConfig.nick,
                channels: connConfig.chans
            }
          }

          var onopen = function(message, ircConnection) {
            callback(ircConnection, message)
          }

          connection.connect(config, onopen, listener)

        }
        else {
          console.log('Handle if user does not have any connections')
        }
      })
    }

    var rewind = function(newListeners) {
      /*
       * Don't really like the solution of
       * overwriting the listeners on rewind
       *
       * Added because when new LogControllers
       * for each route was created the listeners
       * no longer responded, and we needed to attach
       * new listeners.
       *
       * Should look for a solution were the listener
       * list is manipulated at an higher abstraction
       * level
       *
       */
      listeners = newListeners
      logs.forEach(function(message) {
        pushMessage(message)
      })
    }

    return {
      connect: connect,
      rewind: rewind
    }

  }

})
