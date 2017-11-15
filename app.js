"use strict";

var noble = require('noble');

console.log('started');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn')
    noble.startScanning([], false);
  else
    noble.stopScanning();
});

noble.on('discover', function(peripheral) {  
  console.log('discovered', peripheral.advertisement.localName);

  if (peripheral.uuid === '5cf821a2c281') {
    console.log('connecting to', peripheral.uuid, peripheral.advertisement);

    peripheral.on('disconnect', function() {
      console.log("disconnected", peripheral.advertisement.localName)
    });

    peripheral.connect(function(error) {
      if (error) { console.log('error during connection', error); }
      else {
        peripheral.on('disconnect', function() {
          console.log("disconnected", peripheral.advertisement.localName)
        }); 
      }
    });

  }
});

noble.on('scanStart', function() {
  console.log('scan start');
});
noble.on('scanStop', function() {
  console.log('scan stop');
});
noble.on('warning', function(msg) {
  console.log('warning', msg);
});

