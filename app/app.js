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

app.factory('Connection', function($location) {

	function Connection(url, listeners) {
		var self = this
		, listeners = listeners || []

		this.send = function(message) {
			websocket.send(JSON.stringify(message))
		}

		this.connect = function() {
			var locationSearch = $location.search()
			, connection = {
				server: locationSearch.server,
				nick: locationSearch.nick,
				channels: locationSearch.channels.split(',').map(function(chan) {
					if (chan.indexOf('#') == 0) return chan
					return '#' + chan
				})
			}
			if (locationSearch.key != null) {
				var reconnect = {
					type: 'reconnect',
					key: locationSearch.key,
					raw: true
				}
				this.send(reconnect)
			}
			else if (verify.connection(connection)) {
				var connect = {
					type: 'connect',
					connection: connection,
					raw: true
				}
				this.send(connect)
			}
		}

		var websocket = new WebSocket(url)
		websocket.onopen = function(e) {
			self.connect()
		}

		websocket.onmessage = function(e) {
			var parsed = JSON.parse(e.data)
			listeners.forEach(function(listener) {
				listener(parsed)
			})
		}

	}
	return Connection
})

app.controller('LogController', [
'$scope', '$location', 'verify', 'Connection',
function($scope, $location, verify, Connection) {
	$scope.events = []
	var listener = function(parsed) {
			$scope.$apply(function() {
				if (parsed.type == 'msg') $scope.events.push(parsed)
				console.log(parsed)
			})
	}
	var connection = new Connection('ws://localhost:8080', [listener])



}])
