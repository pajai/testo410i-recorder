"use strict";

var noble = require('noble');

console.log('started');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn')
    noble.startScanning([], false);
  else
    noble.stopScanning();
});

var charList = []

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
        console.log("connected", peripheral.advertisement.localName)        

        peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics){
          //console.log('discovered services & characteristics', error, services, characteristics);

          if (error) {
            console.log('an error occured during discovery', error);
          }

          for (let i = 0; i < characteristics.length; i++) {
            var c = characteristics[i];
            if (c.properties.indexOf('indicate') !== -1) {
              console.log('discovered characteristic', c.name, c.uuid, c.properties);

              charList.push(c);
              subscribe(charList.length - 1);
            }
          }

        });
      }
    });

  }
});

const subscribe = (idx) => {
  var c = charList[idx];

  c.once('notify', function(state){ console.log('notify change for', c.name, c.uuid, c.properties, state); });

  c.on('data', function(data, isNotification){
    console.log('received data', data, 'for', c.name, c.uuid);
  });

  c.subscribe(function(error){ 
    console.log('subscribed', c.name, c.uuid, c.properties, error); 
  });

  c.notify(true, function(error) { 
    console.log('notified', c.name, c.uuid, c.properties, error); 
  });
};

noble.on('scanStart', function() {
  console.log('scan start');
});
noble.on('scanStop', function() {
  console.log('scan stop');
});
noble.on('warning', function(msg) {
  console.log('warning', msg);
});

