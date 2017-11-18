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

        peripheral.discoverServices(['fff0'], (error, services) => {
          if (error) { console.log('error while discovering services', error); }
          else {
            if (services.length !== 1) {
              console.log('did not find 1 service, found', services.length);
            }
            else {
              var s = services[0];
              console.log('discovered service', s.uuid);
              discoverCharacteristics(s);
            }
          }
        });


        //peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics){

        // peripheral.discoverSomeServicesAndCharacteristics([], ['2902'], function(error, services, characteristics) {
        //
        //   //console.log('discovered services & characteristics', error, services, characteristics);
        //
        //   if (error) {
        //     console.log('an error occured during discovery', error);
        //   }
        //
        //   for (let i = 0; i < characteristics.length; i++) {
        //     var c = characteristics[i];
        //     console.log('discovered characteristic', c.name, c.uuid, c.properties);
        //
        //     readCharacteristic(c);
        //     startNotify(c);
        //     subscribe(c);
        //
        //   }
        //
        // });

      }
    });

  }
});

const discoverCharacteristics = (s) => {

  s.discoverCharacteristics([], (error, characteristics) => {
    characteristics.forEach((c) => {
      console.log('discovered characteristic', c.uuid, c.name, c.properties);
      startNotify(c);
      subscribe(c);
    });
  });

};

const startNotify = (c) => {
  if (c.uuid === 'fff1') {
    console.log('enabling notification on service fff1');

    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt8(0x1, 0);
    console.log('buffer constructed', buf);

    c.write(buf, true, (error) => {
      if (error) console.log('error while writing fff1', error);
      else console.log('written to fff1');
    });
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
  if (c.uuid !== 'fff2') {
    return;
  }

  console.log('subscribing to characteristic', c.name, c.uuid, c.properties);
  charList.push(c);

  c.subscribe(function(error){
    console.log('subscribed', c.name, c.uuid, c.properties, error ? error : 'no error');
  });

  c.on('data', function(data, isNotification){
    console.log('received data', data, 'for', c.name, c.uuid);
  });

  // c.on('read', function(data, isNotification){
  //   console.log('received read', data, 'for', c.name, c.uuid);
  // });

/*
  c.notify(true, function(error) {
    console.log('notified', c.name, c.uuid, c.properties, error ? error : 'no error');
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

