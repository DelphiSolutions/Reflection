var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    screenshot = require('./screenshot'),
    app = express(),
    maxHeight = process.env.MAX_HEIGHT || 1200,
    maxWidth = process.env.MAX_WIDTH || 1600,
    port = process.env.PORT || 3001;
;

app.configure(function() {
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/*.png', function(request, response) {
  var url = request.query.url,
      width = request.query.width,
      height = request.query.height;

  if (!/^https?:\/\/\w+.opengov.com/i.test(url)) {
    response.send(403, 'URL to screenshot must be a property of OpenGov');
    return;
  }

  if (!width || width <= 0 || width > maxWidth) {
    width = 960;
  }
  if (!height || height <= 0 || height > maxHeight) {
    height = 640;
  }

  // Pass the params off to the Phantom queue
  screenshot.queue({
    url: url,
    width: width,
    height: height,
    response: response
  });
});

console.log('Reflection listening on port ' + port + '...');
app.listen(port);