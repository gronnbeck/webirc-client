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

app.factory('Connection', ['verify', function(verify) {

	function Connection(url) {

		this.connect = function(config, listeners) {
			var self = this
			, listeners = listeners || []
			, connection = config.connection

			self.send = function(message) {
				websocket.send(JSON.stringify(message))
			}

			var connect = function() {
				if (config.key != null) {
					var reconnect = {
						type: 'reconnect',
						key: config.key,
						raw: true
					}
					self.send(reconnect)
				}
				else if (verify.connection(connection)) {
					var connect = {
						type: 'connect',
						connection: connection,
						raw: true
					}
					self.send(connect)
				}
			}

			var websocket = new WebSocket(url)
			websocket.onopen = function(e) {
				connect()
			}

			websocket.onmessage = function(e) {
				var parsed = JSON.parse(e.data)
				listeners.forEach(function(listener) {
					listener(parsed)
				})
			}
		}
	}
	return Connection
}])

app.controller('LogController', [
'$scope', '$location', 'Connection',
function($scope, $location, Connection) {
	$scope.events = []

	$scope.parseDate = function(date) {
		return moment(date).format("HH:mm:ss")
	}

	var listener = function(parsed) {
			$scope.$apply(function() {
				if (parsed.type == 'msg') $scope.events.push(parsed)
				console.log(parsed)
			})
	}
	var connection = new Connection('ws://localhost:8080')
	var locationSearch = $location.search()
	, config = {
		key: locationSearch.key,
		connection: {
				server: locationSearch.server,
				nick: locationSearch.nick,
				channels: locationSearch.channels.split(',').map(function(chan) {
					if (chan.indexOf('#') == 0) return chan
					return '#' + chan
			})
		}
	}

	connection.connect(config, [listener])



}])
