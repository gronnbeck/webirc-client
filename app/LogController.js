app.controller('LogController', [
'$scope', 'Connection', '$routeParams', 'IRCConnection', 'api',
function($scope, Connection, $routeParams, IRCConnection, api) {

  $scope.events = []
  $scope.allLogs = []

  var filter = function(from, me) {
    if (_.isEmpty(from)) {
      return function() { return true }
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

  var listener = function(parsed) {
      $scope.$apply(function() {
        if (parsed.type == 'msg') $scope.allLogs.push(parsed)
        if (parsed.type == 'connected')
        console.log(parsed)
      })
  }


  api.all(function(all) {
    var connConfig = _.first(all)
    , config = {
      key: connConfig.key,
      connection: {
          server: connConfig.server,
          nick: connConfig.nick,
          channels: connConfig.chans
      }
    }

    var connection = new Connection('ws://localhost:8080')
    var irc = connection.connect(config, [listener])

  })

  $scope.to = ''
  $scope.message = ''
  $scope.send = function() {
      var msg = {
        type: 'msg',
        to: $scope.to,
        key: locationSearch.key,
        payload: $scope.message
      }

      irc.send(msg)
      $scope.allLogs.push(_.extend(msg, { from: locationSearch.nick }))
  }



}])
