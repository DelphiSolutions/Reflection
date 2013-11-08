/**
 * This module facilitates calls out to a PhantomJS process to take
 * screenshots of a provided URL.  In addition, it throttles said requests
 * such that only a given number of PhantomJS processes run concurrently.
 */

var async = require('async'),
    childProcess = require('child_process'),
    fs = require('fs'),
    nProcesses = process.env.N_PROCESSES || 4,
    queue;

// Queue to put a ceiling on the number of PhantomJS processes running concurrently
queue = async.queue(takeScreenshot, nProcesses);
exports.queue = queue.push  // Make this symbol visible so other modules can queue

function takeScreenshot(args) {
  var imageName = args.imageName,
      response = args.response,
      output;

  delete args.response;

  // Spin off a PhantomJS process and attach event handlers to its outputs
  childProcess.spawn('phantomjs', ['--ssl-protocol=any', 'phantom/rasterize.js', JSON.stringify(args)])
      .on('close', onExit)
      .stdout.on('data', function(line) {
        output = line;
      });

  // This method will be called when the PhantomJS process terminates
  function onExit(code) {
    if (code !== 0) {
      console.log('PhantomJS process died unexpectedly');
      return response.send(500);
    }

    output = JSON.parse(output);
    if ('error' in output) {
      console.log('PhantomJS error: ' + output.error);
      return response.send(500);
    }

    fs.readFile(output.file, function(error, data) {
      if (error) {
        console.log('Image file read error: ' + error);
        return response.send(500);
      }

      console.log('Produced screenshot for URL `' + args.url + '`');

      // Success!  Return image data to the browser...
      response.setHeader('Content-Disposition', 'attachment; filename="' + imageName + '"');
      response.setHeader('Content-Type', 'image/png');
      response.send(data);
    });
  }
}