app.directive('navigation', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/nav.html',
    controller: function($scope, $rootScope, api, IRCConnection) {
      $scope.chans = []

      $scope.parseUri = function(uri) {
        return uri.replace('#', '%23')
      }

      $rootScope.$on('irc-add-channel', function(event, chan) {
        if (!_.contains($scope.chans, chan)) {
          $scope.$apply(function() {
            $scope.chans.push(chan)
          })
        }
      })

      $scope.$watch('chans', function(newVal) {
        if (!_.isEmpty($scope.model)) {
          $scope.model.windows = newVal
        }
      })

      $scope.addNetwork = function() {
        var network = $scope.network
        , nick = $scope.nick
        , channels = ['#nplol']
        , connection = new IRCConnection(network, nick, channels, null)
        api.insert(connection, function() {
          console.log('added a new connection')
        })
      }

      $scope.ifNoNetworkAdded = function() {
        return $scope.model == null
      }
    }
  }
})
