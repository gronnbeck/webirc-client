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
