app.factory('irc', function(Connection, IRCConnection, api, config) {
  var uri = config.uri
  return function(userId, listeners) {


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
          console.log(user)
          console.log(config)
          callback(connection.connect(config, [listener]))

        }
        else {
          console.log('Handle if user does not have any connections')
        }
      })


    }





    return {
      connect: connect
    }
  }


})
