(function () {
    if(!Bluetooth){
        throw new Error("Bluetooth not initialized");
    }
    if(!bluetoothSerial){
        throw new Error("bluetoothSerial not initialized");
    }

    Bluetooth.prototype.init = function () {

    };
    Bluetooth.prototype.connect = function () {};
    Bluetooth.prototype.subscribe = function () {};
    Bluetooth.prototype.write = function () {};
})();