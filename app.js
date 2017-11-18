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

        //peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics){

        peripheral.discoverSomeServicesAndCharacteristics([], ['2902'], function(error, services, characteristics) {

          //console.log('discovered services & characteristics', error, services, characteristics);

          if (error) {
            console.log('an error occured during discovery', error);
          }

          for (let i = 0; i < characteristics.length; i++) {
            var c = characteristics[i];
            console.log('discovered characteristic', c.name, c.uuid, c.properties); 

            readCharacteristic(c);
            startNotify(c);
            subscribe(c);

          }

        });
      }
    });

  }
});

const startNotify = (c) => {
  if (c.uuid === '2902') {
    console.log('enabling notification on service fff2');

    const buf = Buffer.allocUnsafe(4);
    buf.writeUInt32BE(0x1, 0);
    console.log('buffer constructed', buf);

    c.write(buf, true, (error) => { console.log('error while writing 2902', error); });
  }
}

const readCharacteristic = (c) => {
  if (c.properties.indexOf('read') !== -1) {
    c.read((error, data) => {
      if (error) { console.log('error while reading char', c.name, c.uuid, c.properties, error); }
      else { console.log('read value', data.toString('utf8'), c.name, c.uuid, c.properties); }
    });

    c.once('descriptorsDiscover', function(descriptors){
      console.log('descriptors discovered', descriptors);
    });

  } 
};

const subscribe = (c) => {
  if (c.properties.indexOf('notify') === -1 || c.properties.indexOf('indicate') === -1) {
    return;
  }

  console.log('discovered characteristic', c.name, c.uuid, c.properties);
  charList.push(c);
  //c = charList[idx];

  //c.once('notify', function(state){ console.log('notify change for', c.name, c.uuid, c.properties, state); });

  c.notify(true, function(error) { 
    console.log('notified', c.name, c.uuid, c.properties, error ? error : 'no error'); 
  });

  c.on('data', function(data, isNotification){
    console.log('received data', data, 'for', c.name, c.uuid);
  });

  c.on('read', function(data, isNotification){
    console.log('received read', data, 'for', c.name, c.uuid);
  });

/*
  c.subscribe(function(error){ 
    console.log('subscribed', c.name, c.uuid, c.properties, error ? error : 'no error'); 
  });
 
  c.once('descriptorsDiscover', function(descriptors){
    console.log('descriptors discovered', descriptors);
  });
*/

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

