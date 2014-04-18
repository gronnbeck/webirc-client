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
