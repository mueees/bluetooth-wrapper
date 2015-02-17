function Bluetooth(initFn){
    this.initFn = initFn;
    this.init();
}

(function () {
    Bluetooth.prototype = {
        init: function () {
            throw new Error('should be defined');
        },
        connect: function () {
            throw new Error('should be defined');
        },
        subscribe: function () {
            throw new Error('should be defined');
        },
        write: function () {
            throw new Error('should be defined');
        }
    };
})();