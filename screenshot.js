/**
 * This module facilitates calls out to a PhantomJS process to take
 * screenshots of a provided URL.  In addition, it throttles said requests
 * such that only a given number of PhantomJS processes run concurrently.
 */

var async = require('async'),
    child_process = require('child_process'),
    fs = require('fs'),
    queue;

// Queue to ensure a maximum of 5 PhantomJS processes running concurrently
queue = async.queue(takeScreenshot, 5);
exports.queue = queue.push  // Make this symbol visible so other modules can queue

function takeScreenshot(args) {
  var output,
      response;

  response = args.response;
  delete args.response;

  // Spin off a PhantomJS process and attach event handlers to its outputs
  child_process.spawn('phantomjs', ['phantom/rasterize.js', JSON.stringify(args)])
      .on('close', onExit)
      .stdout.on('data', function(line) {
        output = line;
      });

  // This method will be called when the PhantomJS process terminates
  function onExit(code) {
    if (code !== 0) {
      console.log('PhantomJS process died unexpectedly');
      response.send(500);
      return;
    }

    output = JSON.parse(output);
    if ('error' in output) {
      console.log('PhantomJS error: ' + output.error);
      response.send(500);
      return;
    }

    fs.readFile(output.file, function(error, data) {
      if (error) {
        console.log('Image file read error: ' + error);
        response.send(500);
        return
      }

      // Success!  Return image data to the browser...
      response.setHeader('Content-Type', 'image/png');
      response.send(data);
    });
  }
}