
var app = angular.module('irc-client', []);

app.controller('LogController', ['$scope', function($scope) {
	var websocket = new WebSocket('ws://localhost:1881');

	websocket.onmessage = function(event) {
		console.log(event);
	}
}]);