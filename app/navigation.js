app.directive('navigation', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/nav.html',
    controller: function($scope, $rootScope, api, IRCConnection) {

      $scope.parseUri = function(uri) {
        return uri.replace('#', '%23')
      }

      $rootScope.$on('irc-add-channel', function(event, chan) {
        if (!_.contains($scope.model.windows, chan)) {
          $scope.chans.push(chan)
        }
      })

      var refresh = function() {
        api.all(function(all) {
          $scope.model = _.first(all)
          if (!_.isEmpty($scope.model)) {
            $scope.chans = _.clone($scope.model.windows)
          }
        })
      }

      $scope.$watch('chans', function(newVal) {
        if (!_.isEmpty($scope.model)) {
          $scope.model.windows = newVal
        }
      })


      var save = function() {
        api.insert($scope.model, function(model) {
          console.log('saved model')
        })
      }
      , lazySave = _.debounce(save, 300)

      $scope.$watch('model', function(newVal, oldVal) {
        if (oldVal == null) return
        lazySave()
      }, true)

      $scope.addNetwork = function() {
        var network = $scope.network
        , nick = $scope.nick
        , channels = ['#nplol']
        , connection = new IRCConnection(network, nick, channels, null)
        api.insert(connection, function() {
          console.log('added a new connection')
          refresh()
        })
      }

      $scope.ifNoNetworkAdded = function() {
        return $scope.model == null
      }

      refresh()
    }
  }
})
