// Start sails and pass it command line arguments

var path = require('path');

// increase outgoing sockets
require('http').globalAgent.maxSockets = 200;

global.APPLICATION_PATH = __dirname;
global.UPLOAD_PATH = path.join(APPLICATION_PATH, '.tmp', 'public', 'uploads');

require('sails').lift(require('optimist').argv, function(app){


});

/*
 Cluster testing
var cluster = require('cluster');

if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {

        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {

  require('sails').lift(require('optimist').argv, function(err, sails){
  
    console.log('Worker ' + cluster.worker.id + ' running!');
  
  });
} */
