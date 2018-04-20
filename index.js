// "use strict";

var Config = require("./config");
var Device = require("./device");
var SerialPort = require("serialport");
var Protocol = require("./modbus");
var Utils = require("./utils");

console.log(Config);

var role;
var address;
var port;

if (process.argv[2] === "1") {
    role = 1;
    port = new SerialPort(Config.master.portName, {
        baudRate: Config.baudRate
    });
} else if (process.argv[2] === "0") {

    role = 0;
    port = new SerialPort(Config.slave.portName, {
        baudRate: Config.baudRate
    });

} else {
    throw new Error("wrong role in command line");
}



var protocol = new Protocol();
var device = new Device(role, port, protocol);




// Open errors will be emitted as an error event
port.on("error", function (err) {
    console.log("Error: ", err.message);
});

port.on("open", function () {
    console.log("Port opened");
});


if (role === 1) {
    // master
    var index = 0;

    function* getAddress() {
        while (1) {
            if (index >= Config.master.addrLst.length) {
                index = 0;
            }

            yield Config.master.addrLst[index++];
        }
    }
    var addresses = getAddress();

    setInterval(function () {
        var addr = addresses.next().value;
        Utils.printYellow("\nMaster Send to address:", addr);
        device.sendMsg(addr, protocol.DEF.FUNC_READ_COIL, 1, 222);
    }, Config.master.period);

} else {
    // slave
}