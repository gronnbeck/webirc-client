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
