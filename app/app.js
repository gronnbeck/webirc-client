var app = angular.module('irc-client', ['ngRoute'])

app.config(function($routeProvider) {

	$routeProvider
	.when('/:from', {
		templateUrl: 'templates/logs.html',
		controller: 'LogController'
	})
	.when('/', {
		templateUrl: 'templates/logs.html',
		controller: 'LogController'
	})

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
			return self
		}
	}
	return Connection
}])

app.controller('LogController', [
'$scope', '$location', 'Connection', '$routeParams',
function($scope, $location, Connection, $routeParams) {

	$scope.events = []
	$scope.allLogs = []

	var filter = function(from, me) {
		if (from.indexOf('#') == -1) return function(log) {
			return log.from == from &&
			log.to == me
		}
		return function(log) {
			return log.to == from
		}
	}

	$scope.$watchCollection('allLogs', function(val) {
		var filterFunc = filter($routeParams.from, $routeParams.nick)
		$scope.events = val.filter(filterFunc)
	})

	$scope.parseDate = function(date) {
		return moment(date).format("HH:mm:ss")
	}

	var listener = function(parsed) {
			$scope.$apply(function() {
				if (parsed.type == 'msg') $scope.allLogs.push(parsed)
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

	var irc = connection.connect(config, [listener])
	$scope.to = ''
	$scope.message = ''
	$scope.send = function() {
			var msg = {
				type: 'msg',
				to: $scope.to,
				key: locationSearch.key,
				payload: $scope.message
			}

			irc.send(msg)
			$scope.allLogs.push(_.extend(msg, { from: locationSearch.nick }))
	}



}])
