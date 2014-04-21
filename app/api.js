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
    var connections = _.chain(parsed).map(function(c) {
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

        var updated = [connection]

        localStorage.setItem('connections', JSON.stringify(updated))

        callback(updated)
      })

    },
    get: function(id, callback) {
      all(function(conns) {
        var conn = _.chain(conns)
        .filter(function(c) { return c.key == id })
        .first()
        .value()
        callback(conn)
      })
    }
  }
})
