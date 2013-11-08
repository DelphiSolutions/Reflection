/**
 * This module is executed inside PhantomJS to instrument a requested screenshot.
 **/

var system = require('system'),
    uuid = require('node-uuid'),
    webpage = require('webpage');

function writeJson(object) {
  console.log(JSON.stringify(object));
}

function main() {
  var config = JSON.parse(system.args[1]),
      fileName = uuid.v4() + '.png',
      file = '/tmp/' + fileName,
      page = webpage.create();

  page.viewportSize = {
    width: config.width,
    height: config.height
  };

  page.open(config.url, function(status) {
    if (status !== "success") {
        throw 'Unable to load URL ' + config.url;
    }
    page.render(file);
    writeJson({file: file});
    phantom.exit();
  });
}

try {
    main();
} catch (error) {
    writeJson({error: error});
}