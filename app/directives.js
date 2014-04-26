app.directive('scrollBottom', function($timeout) {
  return function(scope, element, attrs) {

    var scroll = _.first(element)

    scroll.scrollTop = scroll.scrollHeight
    var timeout
    scope.$watchCollection('allLogs', function() {
      // place at the end of callstack
      $timeout.cancel(timeout)
      timeout = $timeout(function() {
          scroll.scrollTop = scroll.scrollHeight
      }, 0)

    })

  }
})
