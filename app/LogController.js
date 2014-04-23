app.controller('LogController', [
'$scope', 'Connection', '$routeParams', 'IRCConnection', 'api', 'config', 'irc',
function($scope, Connection, $routeParams, IRCConnection, api, config, IRC) {

  $scope.events = []
  $scope.allLogs = []
  $scope.to = ''
  $scope.message = ''

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

    self.send(msg)
    received(_.extend(msg, { from: locationSearch.nick }))
  }

  var received = function(message) {
    $scope.allLogs.push(message)
    if (message.to.indexOf('#') == 0) {
      $scope.$emit('irc-add-channel', message.to)
    }
  }
  var self = this
  IRC([received], function(bindings) {
    self.send = bindings.send
  })

}])
