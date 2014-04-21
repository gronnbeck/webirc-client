app.controller('LogController', [
'$scope', 'Connection', '$routeParams', 'IRCConnection', 'api',
function($scope, Connection, $routeParams, IRCConnection, api) {

  $scope.events = []
  $scope.allLogs = []
  $scope.to = ''
  $scope.message = ''

  var filter = function(from, me) {
    if (_.isEmpty(from)) {
      return function() { return false }
    }
    if (from.indexOf('#') == -1) return function(log) {
      return log.from == from &&
      log.to == me
    }
    return function(log) {
      return log.to == from
    }
  }

  $scope.$watchCollection('allLogs', function(val) {
    var filterFunc = filter($routeParams.from, $routeParams.nick)
    $scope.events = val.filter(filterFunc)
  })

  $scope.parseDate = function(date) {
    return moment(date).format("HH:mm:ss")
  }


  $scope.send = function() {
    var msg = {
      type: 'msg',
      to: $scope.to,
      key: locationSearch.key,
      payload: $scope.message
    }

    irc.send(msg)
    received(_.extend(msg, { from: locationSearch.nick }))
  }

  var received = function(message) {
    $scope.allLogs.push(message)
    if (message.to.indexOf('#') == 0) {
      $scope.$emit('irc-add-channel', message.to)
    }
  }

  var listener = function(parsed) {
      $scope.$apply(function() {
        if (parsed.type == 'msg') { received(parsed) }
        if (parsed.type == 'disconnected') {

          api.get(parsed.key, function(conn) {
            var config = {
              connection: {
                server: conn.server,
                nick: conn.nick,
                channels: conn.chans
              }
            }

            connect(config)
          })

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
        //console.log(parsed)
      })
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
    connect(connConfig)
  }

  var connect = function(config) {
    var connection = new Connection('ws://localhost:8080')
    var irc = connection.connect(config, [listener])
  }

  api.all(function(all) {
    if (_.isEmpty(all)) {
      return
    }
    var connConfig = _.first(all)
    try2connect(connConfig)
  })

}])
