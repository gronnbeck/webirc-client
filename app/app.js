var app = angular.module('irc-client', []);

app.controller('LogController', ['$scope', function($scope) {
	var websocket = new WebSocket('ws://localhost:8080');

	$scope.events = [];
	websocket.onmessage = function(e) {
		console.log(e);
		$scope.$apply(function() {
			$scope.events.push(e);
		});
	};

	$scope.connect = function() {
		var connect = JSON.stringify({ 
			type: 'connect', 
			connection: {
				server: 'irc.freenode.net', 
				nick: 'tester-irc-proxy', 
				channels: ['#nplol', '#pekkabot'] 
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