var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var static = require('node-static');
var fileServer = new static.Server('../client');

function handler(request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}

io.on('connection', connectClient);

function connectClient(socket){
    socket.emit('data', {hello: 'world'});

    socket.on('request', function (data) {
        socket.emit('response', {
            id: data.id,
            status: 200,
            data: {
                text: "Ping pong"
            }
        });
    });

    socket.on('data', function (data) {
        console.log(data);
    });

    setInterval(function () {
        socket.emit('data', {
            test: 'test'
        });
    }, 500);

    /*socket.on('disconnect', function(){
        console.log( socket.name + ' has disconnected from the chat.' + socket.id);
    });*/
}

app.listen(3000);