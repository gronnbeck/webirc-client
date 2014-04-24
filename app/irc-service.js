app.factory('irc', function(Connection, IRCConnection, api, config) {
  var uri = config.uri
  var _connection = null
  var connection = new Connection(uri)
  var logs = []

  return function(userId, listeners) {
    var pushMessage = function(message) {
      _.each(listeners, function(listen) {
        listen(message)
      })
    }
    var listener = function(parsed) {
        if (parsed.type == 'msg') {
          logs.push(parsed)
          pushMessage(parsed)
        }
        if (parsed.type == 'disconnected') {

          console.log('handle reconnect')

        }
        if (parsed.type == 'connected') {
          // rethink the way we handle connection
          console.log('handle connected components')
        }
    }

    var connect = function(callback) {

      if (_connection !== null && _connection !== undefined) {
        callback(_connection)
        _.each(logs, function(log) {
          pushMessage(log)
        })
      }
      else {

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
            _connection = connection.connect(config, [listener])

            callback(_connection)

          }
          else {
            console.log('Handle if user does not have any connections')
          }
        })
      }
    }

    return {
      connect: connect,
      logs: logs
    }
  }


})
