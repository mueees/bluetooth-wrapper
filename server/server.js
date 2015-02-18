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

    socket.emit('data', {hello: 'world'});

    socket.on('request', function (options) {
        if(!options.id) return false;

        if(!options.url) {
            return sendError(options.id, 'Url request should exist');
        }

        switch (options.url){
            case 'connect':
                if(!options.data.address){
                    return sendError(options.id, "Doesn't have address");
                }
                serial = new BluetoothSerialPort();
                serial.findSerialPortChannel(options.data.address, function (channel) {
                    serial.connect(options.data.address, channel, function () {
                        sendResponse({
                            id: options.id
                        });

                        socket.on('data', function (data) {
                            serial.write(new Buffer(data+'', 'utf-8'), function(err, count) {
                                if (err) {
                                    console.log('Error received: ' + err);
                                } else {
                                    console.log('Bytes writen is: ' + count);
                                }
                            });
                        });

                        serial.on('closed', function () {
                            console.log("Bluetooth disconected");
                        });
                    });
                });
                break;
        }
    });

    socket.on('disconnect', function () {
        if(serial) serial.close();
        serial = null;
    });

    function sendError(idRequest, message) {

    }

    function sendResponse(options){
        socket.emit('response', {
            id: options.id,
            status: options.status || 200,
            data: options.data || {}
        });
    }

    /*socket.on('disconnect', function(){
     console.log( socket.name + ' has disconnected from the chat.' + socket.id);
     });*/
}

app.listen(3000);