app.directive('navigation', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/nav.html',
    controller: function($scope, $rootScope) {
      $scope.chans = []

      $scope.parseUri = function(uri) {
        return uri.replace('#', '%23')
      }

      $rootScope.$on('irc-add-channel', function(event, chan) {
        if (!_.contains($scope.chans, chan)) {
          $scope.chans.push(chan)
        }
      })
    }
  }
})
