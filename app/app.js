var app = angular.module('irc-client', ['ngRoute'])

app.config(function($routeProvider) {
})

app.factory('Verifier', function() {
	function Verifier (key, verifier) {
		this.key = key
		this.verify = verifier
	}
	return Verifier
})

app.factory('verify', ['Verifier', function(Verifier) {
	var verifyServer = new Verifier('server', function(val) {
		return val != null
	})
	, verifyNick = new Verifier('server', function(val) {
		return val != null
	})
	, verifyChan = new Verifier('channels', function(val) {
		return val != null
	})
	, verifiers = [verifyServer, verifyNick, verifyChan]
	return {
		connection: function(connection) {
			var verify = verifiers.map(function(verifier) {
				return verifier.verify(connection[verifier.key])
			})
			var all = verify.reduce(function(acc, curr) {
				return acc && curr
			}, true)
			return all
		}
	}
}])

app.controller('LogController', [
'$scope', '$location', 'verify', function($scope, $location, verify) {
	var websocket = new WebSocket('ws://localhost:8080')

	$scope.events = []
	websocket.onmessage = function(e) {
		var parsed = JSON.parse(e.data)
		$scope.$apply(function() {
			if (parsed.type == 'msg') $scope.events.push( JSON.stringify(parsed) )
			else console.log(parsed)
		})
	}

	$scope.connect = function() {
		var locationSearch = $location.search()
		, connection = {
			server: locationSearch.server,
			nick: locationSearch.nick,
			channels: locationSearch.channels.split(',').map(function(chan) {
				if (chan.indexOf('#') == 0) return chan
				return '#' + chan
			})
		}
		if (verify.connection(connection)) {
			var connect = JSON.stringify({
				type: 'connect',
				connection: connection,
				key: null
			})
			websocket.send(connect)
		}

	}
}])
