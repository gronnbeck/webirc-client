var from = ['marvin', 'zaphod', 'trillian', 'arthur', 'ford', 'slatibartfast']
, chans = ['#magrathea', '#earth', '#Betelgeuse']
, sentences = [
  "\"Space,\" it says, \"is big. Really big. You just won't believe how vastly, hugely, mindbogglingly big it is. I mean, you may think it's a long way down the road to the chemist's, but that's just peanuts to space, listen...\"",
  "There's an infinite number of monkeys outside who want to talk to us about this script for Hamlet they've worked out.",
  "I think you ought to know I'm feeling very depressed",
  "All the doors in this spaceship have a cheerful and sunny disposition. It is their pleasure to open for you, and their satisfaction to close again with the knowledge of a job well done",
  "If there's anything more important than my ego around, I want it caught and shot now"
]
, generate = function() {
    var random = function(source) {
      return source[Math.floor(Math.random() * source.length)]
    }

  var i = 0
  , res = [];
  for (i = 0; i < 100; i ++) {
    res.push({
      type: 'msg',
      from: random(from),
      to: random(chans),
      payload: random(sentences)
    })
  }
  return res
}



module.exports = generate()
