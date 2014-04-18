var app = angular.module('irc-client', ['ngRoute'])

app.config(function($routeProvider) {

	$routeProvider
	.when('/', {
		templateUrl: 'templates/logs.html',
		controller: 'LogController'
	})
	.when('/:from', {
		templateUrl: 'templates/logs.html',
		controller: 'LogController'
	})


})

app.factory('api', function(IRCConnection) {
	var parse = function(obj) {
		try {
			return JSON.parse(obj)
		} catch(e) {
			return {}
		}
	}
	var all = function(callback) {
		var all = localStorage.getItem('connections')
		var parsed = _.isEmpty(all) ? {} : parse(all)
		var connections = _.chain(parsed).map(function(conns) {
			var c = JSON.parse(conns)
			return new IRCConnection(
				c.server,
				c.nick,
				c.chans,
				c.key)
		}).value()
		callback(connections)
	}
	return {
		all: function(callback) {
			all(callback)
		},
		insert: function(connection, callback) {
			all(function(connections) {
				connections[connection.key] = JSON.stringify(connection)
				localStorage.setItem('connections', JSON.stringify(connections))
				callback(connections)
			})

		},
		get: function(id, callback) {

		}
	}
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

app.factory('IRCConnection', function() {
	function IRCConnection(server, nick, chans, key) {
		this.windows = []
		this.key = key
		this.server = server
		this.nick = nick
		this.chans = chans
	}
	return IRCConnection
})

app.controller('LogController', [
'$scope', 'Connection', '$routeParams', 'IRCConnection', 'api',
function($scope, Connection, $routeParams, IRCConnection, api) {

	$scope.events = []
	$scope.allLogs = []

	var filter = function(from, me) {
		if (_.isEmpty(from)) {
			return function() { return true }
		}
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
				if (parsed.type == 'connected')
				console.log(parsed)
			})
	}


	api.all(function(all) {
		console.log(all)
		var connConfig = _.first(all)
		, config = {
			key: connConfig.key,
			connection: {
					server: connConfig.server,
					nick: connConfig.nick,
					channels: connConfig.chans
			}
		}
		
		var connection = new Connection('ws://localhost:8080')
		var irc = connection.connect(config, [listener])

	})

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
