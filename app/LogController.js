app.controller('LogController', [
'$scope', 'Connection', '$routeParams', 'IRCConnection', 'api', 'config', 'IRCContainer',
function($scope, Connection, $routeParams, IRCConnection, api, config, IRCContainer) {

  $scope.allLogs = []

  var uri = config.uri

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

  $scope.$watchCollection('allLogs', function(newVal, oldVal) {
    var filterFunc = filter($routeParams.from, $routeParams.nick)
    $scope.events = newVal.filter(filterFunc)
  })

  $scope.parseDate = function(date) {
    return moment(date).format("HH:mm:ss")
  }

  var received = function(message) {
    $scope.allLogs.push(message)

    if (message.to.indexOf('#') == 0) {
      $scope.$emit('irc-add-channel', message.to)
    }
  }

  var userId = localStorage.getItem('userId')
  var onopen = function(connection, info) {
      $scope.send = function() {
        var msg = {
          type: 'msg',
          to: $routeParams.from,
          key: info.key,
          payload: $scope.message
        }

        connection.send(msg)
        received(_.extend(msg, { from: info.nick }))

      }
  }

  IRCContainer.get(userId, onopen, [received])

}])
