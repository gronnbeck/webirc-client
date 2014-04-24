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
    insert: function(id, user) {
      return $http.post('/api/user/' + id, user)
    },
    get: function(id) {
      return $http.get('/api/user/' + id)
    }
  }
})
