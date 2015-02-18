(function () {
    if(!Bluetooth){
        throw new Error("Bluetooth not initialized");
    }
    if(!io){
        throw new Error("Io not initialized");
    }

    function _getId(){
        var i = 1;
        return function () {
            ++i;
            return i;
        };
    }

    var getId = _getId();

    function Connection(success, bluetoothDisconnected){
        var _this = this;

        this.req = {};

        this.socket = io();

        this.socket.on('connect', function () {
            success();
        });

        this.socket.on('response', function (response) {
            if(!response.id) throw new Error('Cannot find response id');
            if(!response.status) throw new Error('Cannot find response status');

            var data = response.data || {};
            var requestObj = _this.req[response.id];

            if(!requestObj) throw new Error('Cannot find request object');

            if(response.status == 200){
                requestObj.success(data);
            }else{
                requestObj.error(data);
            }

            delete _this.req[response.id];
        });

        this.socket.on('bluetooth:disconnect', function () {
            bluetoothDisconnected();
        });

        this.request = function (url, options) {
            if( !url ) throw new Error("Doesn't have url");
            var id = getId();
            var data = options.data || {};

            _this.req[id] = {
                success: options.success || noop,
                error: options.error || noop
            };

            this.socket.emit('request', {
                url: url,
                data: data,
                id: id
            });
        };

        this.subscribe = function (delimeter, cb) {
            this.socket.on('data', cb);
        };

        this.write = function (string) {
            this.socket.emit('data', string);
        };

        function noop(){}
    }

    Bluetooth.prototype.init = function () {
        var _this = this;
        this.connection = new Connection(function () {
            _this.initFn();
        }, function () {
            if(_this.connectErrorCb) _this.connectErrorCb();
        });
    };

    Bluetooth.prototype.connect = function (address, success, error) {
        var _this = this;
        this.connectSuccessCb = success;
        this.connectErrorCb = error;

        this.connection.request('connect', {
            data: {
                address: address
            },
            success: function (data) {
                _this.connectSuccessCb(data);
            },
            error: function (data) {
                _this.connectErrorCb(data);
            }
        });
    };

    Bluetooth.prototype.subscribe = function (delimiter, cb) {
        this.connection.subscribe(delimiter, cb);
    };

    Bluetooth.prototype.write = function (delimiter, cb) {
        this.connection.write(delimiter, cb);
    }
})();