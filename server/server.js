var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
//var BluetoothSerialPort = require("./node_modules/bluetooth-serial-port/lib/bluetooth-serial-port.js").BluetoothSerialPort;
var BluetoothSerialPort = require("bluetooth-serial-port").BluetoothSerialPort;


var static = require('node-static');
var fileServer = new static.Server('../client');

function handler(request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}

io.on('connection', connectClient);

function connectClient(socket){
    var serial;

    socket.on('request', function (options) {
        if(!options.id) return false;

        if(!options.url) {
            return sendResponse({
                id: options.id,
                status: 400,
                data: {
                    message: 'Url request should exist'
                }
            });
        }

        switch (options.url){
            case 'connect':
                if(!options.data.address){
                    return sendResponse({
                        id: options.id,
                        status: 400,
                        data:{
                            message: "Doesn't have address"
                        }
                    });
                }
                if(serial) serial.close();
                serial = new BluetoothSerialPort();
                serial.findSerialPortChannel(options.data.address, function (channel) {
                    serial.connect(options.data.address, channel, function () {
                        sendResponse({
                            id: options.id,
                            status: 200
                        });

                        serial.on('data', function (buffer) {
                            sendData(buffer.toString('utf-8'));
                        });

                        serial.on('closed', function () {
                            socket.emit('bluetooth:disconnect');
                        });
                    });
                });
                break;
        }
    });

    socket.on('data', function (data) {
        if(!serial) return false;

        serial.write(new Buffer(data+'', 'utf-8'), function(err, count) {
            if (err) {
                console.log('Error received: ' + err);
            } else {
                console.log('Bytes writen is: ' + count);
            }
        });

    });

    socket.on('disconnect', function () {
        if(serial) serial.close();
        serial = null;
    });

    function sendResponse(options){
        socket.emit('response', {
            id: options.id,
            status: options.status || 200,
            data: options.data || {}
        });
    }

    function sendData(data){
        socket.emit('data', data);
    }
}

app.listen(3000);