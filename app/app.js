
var app = angular.module('irc-client', []);

app.controller('LogController', ['$scope', function($scope) {
	var websocket = new WebSocket('ws://localhost:1881');

	$scope.events = [];
	websocket.onmessage = function(e) {
		console.log(e);
		$scope.$apply(function() {
			$scope.events.push(e);
		});
	};
}]);