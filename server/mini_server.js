var path = "./node_modules/bluetooth-serial-port/lib/device-inquiry.js";

(function() {
    "use strict";

    var util = require('util');
    var BluetoothSerialPort = require("./node_modules/bluetooth-serial-port/lib/bluetooth-serial-port.js").BluetoothSerialPort;
    var serial = new BluetoothSerialPort();

    serial.findSerialPortChannel("00:12:09:11:01:52", function(channel) {
        console.log('Found RFCOMM channel for serial port on ' + channel);

        console.log('Attempting to connect...');

        serial.connect("00:12:09:11:01:52", channel, function() {
            console.log('Connected. Sending data...');
            var buf = new Buffer('10011010101s');
            console.log('Size of buf = ' + buf.length);

            serial.on('data', function(buffer) {
                console.log('Size of data buf = ' + buffer.length);
                console.log(buffer.toString('utf-8'));
            });

            serial.write(buf, function(err, count) {
                if (err) {
                    console.log('Error received: ' + err);
                } else {
                    console.log('Bytes writen is: ' + count);
                }

                setTimeout(function() {
                    serial.write(buf, function (err, count) {
                        if (err) {
                            console.log('Error received: ' + err);
                        } else {
                            console.log('Bytes writen is: ' + count);
                        }

                        setTimeout(function() {
                            serial.close();
                            console.log('Closed and ready');
                        }, 5000);
                    });
                }, 5000);
            });
        });
    });
})();