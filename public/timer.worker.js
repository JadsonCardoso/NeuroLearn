var interval = null
var currentSecs = 0

self.onmessage = function (e) {
  var type = e.data.type
  var payload = e.data.payload || {}

  if (type === 'START') {
    currentSecs = payload.secs
    clearInterval(interval)
    interval = setInterval(function () {
      currentSecs--
      if (currentSecs <= 0) {
        clearInterval(interval)
        interval = null
        self.postMessage({ type: 'DONE' })
      } else {
        self.postMessage({ type: 'TICK', secs: currentSecs })
      }
    }, 1000)
  } else if (type === 'PAUSE') {
    clearInterval(interval)
    interval = null
  } else if (type === 'RESET') {
    clearInterval(interval)
    interval = null
    currentSecs = payload.secs || 0
  }
}
