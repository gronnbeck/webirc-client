var app = angular.module('irc-client', ['ngRoute']);

app.config(function($routeProvider) {
})

app.controller('LogController', ['$scope', function($scope) {
	var websocket = new WebSocket('ws://localhost:8080');

	$scope.events = [];
	websocket.onmessage = function(e) {
		var parsed = JSON.parse(e.data);
		$scope.$apply(function() {
			if (parsed.type == 'msg') $scope.events.push( JSON.stringify(parsed) );
			else console.log(parsed);
		});
	};

	$scope.connect = function() {
		var connect = JSON.stringify({
			type: 'connect',
			connection: {
				server: 'irc.freenode.net',
				nick: 'tester-irc-proxy',
				channels: ['#pekkabot']
			},
			key: null
		});

		websocket.send(connect);
	};

	$scope.send = function(msg) {
		var stringified = JSON.stringify({type: 'msg', to: '#nplol', 'payload': msg});
		websocket.send(stringified);
	};
}]);
