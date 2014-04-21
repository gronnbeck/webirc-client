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
          $scope.model.windows.push(chan)
        }
      })

      var refresh = function() {
        api.all(function(all) {
          $scope.model = _.first(all)
          $scope.chans = $scope.model.windows
        })
      }


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

      refresh()
    }
  }
})
