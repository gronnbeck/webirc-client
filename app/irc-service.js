app.factory('irc', function(Connection, IRCConnection, api, config) {
  var uri = config.uri
  var _connection = null
  var connection = new Connection(uri)
  var _info = null
  var logs = []

  return function(userId, listeners) {

    var pushMessage = function(message) {
      _.each(listeners, function(listen) {
        listen(message)
      })
    }

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

            var listener = function(message) {
                if (message.type == 'msg') {
                  logs.push(message)
                  pushMessage(message)
                }
                if (message.type == 'disconnected') {
                  console.log('handle reconnect')
                }
            }

            var onopen = function(message) {
              _info = message
              callback(_connection, _info)
            }
            _connection = connection.connect(config, [onopen], [listener])

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
