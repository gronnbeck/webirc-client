app.factory('irc', function(Connection, IRCConnection, api, config) {
  var uri = config.uri
  var _connection = null
  var _info = null
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
          _info = parsed
          _callback(_connection, _info)
          console.log('handle connected components')
        }
    }

    var _callback
    var connect = function(callback) {

      if (_connection !== null && _connection !== undefined) {
        callback(_connection, _info)
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
            _callback = callback
          }
          else {
            console.log('Handle if user does not have any connections')
          }
        })
      }
    }

    return {
      connect: connect
    }
  }


})
