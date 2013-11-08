var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    screenshot = require('./screenshot'),
    app = express(),
    host = process.env.HOST || 'localhost',
    maxHeight = process.env.MAX_HEIGHT || 1200,
    maxWidth = process.env.MAX_WIDTH || 1600,
    permittedDomains = (process.env.PERMITTED_DOMAINS || 'opengov.com').split(','),
    port = process.env.PORT || 3001;

app.configure(function() {
  app.use(express.logger('dev'));
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', function(request, response) {
  var url = request.query.url,
      width = request.query.width,
      height = request.query.height,
      iamgeName,
      regexMatch,
      urlRegex;

  // Sub domains into the permitted domain regex
  urlRegex = new RegExp('https?://(' + permittedDomains.map(subdomainRegex).join('|') + ')');
  regexMatch = url.match(urlRegex);
  if (!regexMatch || regexMatch.length < 2) {
    return response.send(403, 'URL to screenshot must be a property of OpenGov');
  }

  if (!width || width <= 0 || width > maxWidth) {
    width = 960;
  }
  if (!height || height <= 0 || height > maxHeight) {
    height = 640;
  }

  // The file name will be the host where periods are replaced with dashes
  imageName = regexMatch[1].replace('.', '-') + '-screenshot.png';

  // Pass the params off to the Phantom queue
  screenshot.queue({
    url: url,
    width: width,
    height: height,
    imageName: imageName,
    response: response
  });
});

console.log('Reflection listening on port ' + port);
app.listen(port, host);

function subdomainRegex(domain) {
  return '(\w+.' + domain + ')';
}