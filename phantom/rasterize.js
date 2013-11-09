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
    if (status !== 'success') {
      writeJson({error: 'Unable to load URL ' + config.url})
      console.log('Unable to load URL ' + config.url);
      phantom.exit();
    }

    // This callback will be initiated from within the DOM of the loaded webpage
    page.onCallback = function() {
      page.render(file);
      writeJson({file: file});
      phantom.exit();
    };

    // Attach an event handler to transparency graph complete so that it fires back out to us
    page.evaluate(function() {
      Transparency.graph.canvas._r.on('animation_complete', window.callPhantom);
    });
  });
}

try {
    main();
} catch (error) {
    writeJson({error: error});
}