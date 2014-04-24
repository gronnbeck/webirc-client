app.factory('api', function($http) {
  var all = function() {
    console.log('DEPRECATED: Not part of the new API')
  }
  return {
    all: function() {
      return all()
    },
    register: function() {

    },
    insert: function(user) {

    },
    get: function(id) {
      return $http.get('/api/user/' + id)
    }
  }
})
