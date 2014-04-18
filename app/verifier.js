app.factory('Verifier', function() {
  function Verifier (key, verifier) {
    this.key = key
    this.verify = verifier
  }
  return Verifier
})
