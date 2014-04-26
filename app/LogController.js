app.controller('LogController', [
'$scope', '$routeParams', 'IRCContainer',
function($scope, $routeParams, IRCContainer) {

  $scope.allLogs = []
  $scope.current = $routeParams.from

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

  $scope.safeApply = function(fn) {
  var phase = this.$root.$$phase;
  if(phase == '$apply' || phase == '$digest') {
    if(fn && (typeof(fn) === 'function')) {
      fn();
    }
  } else {
    this.$apply(fn);
  }
};

  var received = function(message) {
    $scope.safeApply(function() {
      $scope.allLogs.push(message)
    })
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
