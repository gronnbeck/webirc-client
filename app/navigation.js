app.directive('navigation', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/nav.html',
    controller: function($scope, $rootScope, api) {

      $scope.parseUri = function(uri) {
        return uri.replace('#', '%23')
      }

      $rootScope.$on('irc-add-channel', function(event, chan) {
        if (!_.contains($scope.model.windows, chan)) {
          $scope.model.windows.push(chan)
        }
      })

      api.all(function(all) {
        $scope.model = _.first(all)
        $scope.chans = $scope.model.windows
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
    }
  }
})
