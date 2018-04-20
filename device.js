"use strict";
var EventEmitter = require("events");
var util = require("util");
var Config = require("./config");
var Utils = require("./utils");
// An array data structure

var REGISTER = {
    1: new Buffer([
        10, 2, 3, 4, 5, 6, 7, 8, 9,
        11, 2, 3, 4, 5, 6, 7, 8, 9,
        12, 2, 3, 4, 5, 6, 7, 8, 9,
        13, 2, 3, 4, 5, 6, 7, 8, 9,
        14, 2, 3, 4, 5, 6, 7, 8, 9,
        15, 2, 3, 4, 5, 6, 7, 8, 9,
        16, 2, 3, 4, 5, 6, 7, 8, 9,
        17, 2, 3, 4, 5, 6, 7, 8, 9,
        18, 2, 3, 4, 5, 6, 7, 8, 9,
        19, 2, 3, 4, 5, 6, 7, 8, 9,
        20, 2, 3, 4, 5, 6, 7, 8, 9,
        21, 2, 3, 4, 5, 6, 7, 8, 9,
        22, 2, 3, 4, 5, 6, 7, 8, 9,
        23, 2, 3, 4, 5, 6, 7, 8, 9,
        24, 2, 3, 4, 5, 6, 7, 8, 9,
        25, 2, 3, 4, 5, 6, 7, 8, 9,
        26, 2, 3, 4, 5, 6, 7, 8, 9,
        27, 2, 3, 4, 5, 6, 7, 8, 9,
        28, 2, 3, 4, 5, 6, 7, 8, 9,
        29, 2, 3, 4, 5, 6, 7, 8, 9,
        30, 2, 3, 4, 5, 6, 7, 8, 9,
        31, 2, 3, 4, 5, 6, 7, 8, 9,
        32, 2, 3, 4, 5, 6, 7, 8, 9,
        33, 2, 3, 4, 5, 6, 7, 8, 9,
        34, 2, 3, 4, 5, 6, 7, 8, 9,
        35, 2, 3, 4, 5, 6, 7, 8, 9,
        36, 2, 3, 4, 5, 6, 7, 8, 9,
        37, 2, 3, 4, 5, 6, 7, 8, 9,
        38, 2, 3, 4, 5, 6, 7, 8, 9,
        39, 2, 3, 4, 5, 6, 7, 8, 9,
    ]),
    2: new Buffer([
        10, 2, 3, 4, 5, 6, 7, 8, 99,
        11, 2, 3, 4, 5, 6, 7, 8, 99,
        12, 2, 3, 4, 5, 6, 7, 8, 99,
        13, 2, 3, 4, 5, 6, 7, 8, 99,
        14, 2, 3, 4, 5, 6, 7, 8, 99,
        15, 2, 3, 4, 5, 6, 7, 8, 99,
        16, 2, 3, 4, 5, 6, 7, 8, 99,
        17, 2, 3, 4, 5, 6, 7, 8, 99,
        18, 2, 3, 4, 5, 6, 7, 8, 99,
        19, 2, 3, 4, 5, 6, 7, 8, 99,
        20, 2, 3, 4, 5, 6, 7, 8, 99,
        21, 2, 3, 4, 5, 6, 7, 8, 99,
        22, 2, 3, 4, 5, 6, 7, 8, 99,
        23, 2, 3, 4, 5, 6, 7, 8, 99,
        24, 2, 3, 4, 5, 6, 7, 8, 99,
        25, 2, 3, 4, 5, 6, 7, 8, 99,
        26, 2, 3, 4, 5, 6, 7, 8, 99,
        27, 2, 3, 4, 5, 6, 7, 8, 99,
        28, 2, 3, 4, 5, 6, 7, 8, 99,
        29, 2, 3, 4, 5, 6, 7, 8, 99,
        30, 2, 3, 4, 5, 6, 7, 8, 99,
        31, 2, 3, 4, 5, 6, 7, 8, 99,
        32, 2, 3, 4, 5, 6, 7, 8, 99,
        33, 2, 3, 4, 5, 6, 7, 8, 99,
        34, 2, 3, 4, 5, 6, 7, 8, 99,
        35, 2, 3, 4, 5, 6, 7, 8, 99,
        36, 2, 3, 4, 5, 6, 7, 8, 99,
        37, 2, 3, 4, 5, 6, 7, 8, 99,
        38, 2, 3, 4, 5, 6, 7, 8, 99,
        39, 2, 3, 4, 5, 6, 7, 8, 99,
    ])

};



function Device(role, port, protocol) {
    EventEmitter.call(this);
    this._port = port;
    this._protocol = protocol;
    this._role = parseInt(role); // 1, 0

    this.attach();

    var that = this;
    this._protocol.on("message", function (msgBuf) {
        //that.emit("message", msg);
        console.log("role", that._role, " Device received valid message");
        console.log(msgBuf);
        if (that._role === 0) {
            that.response(msgBuf);
        } else {
            console.log("Master no need to response");
        }
    });

    console.log("=============================");
    console.log("Role:", this._role);
    console.log("=============================");
}
util.inherits(Device, EventEmitter);

Device.prototype.attach = function () {
    console.log("attach port");

    var that = this;

    this._port.on("data", function (data) {
        console.log("\nRX from port data");
        console.log(data);
        if (that._role === 0) {
            that._protocol.parse(data);
        } else {
            that._protocol.parseResponse(data);
        }

    });

    return this;
};

Device.prototype.feedback = function () {
    console.log("feedback");
};

// add crc , send using uart port
Device.prototype.write = function (buf) {
    var crcValue = this._protocol.crc16(buf);
    var crcBuffer = new Buffer(2);

    crcBuffer.writeUInt16LE(crcValue, 0);

    var data = Buffer.concat([buf, crcBuffer]);

    console.log("port write:", data.toString("hex"));
    this._port.write(data);
};
Device.prototype.sendRsp = function (addr, funcCode, num, dataBuf) {
    var buf = new Buffer(3 + dataBuf.length);
    buf.writeUInt8(addr, 0);
    buf.writeUInt8(funcCode, 1);
    buf.writeUInt8(num, 2);

    for (var i = 0; i < num; i++) {
        buf.writeUInt8(dataBuf[i], 3 + i);
    }
    this.write(buf);

};
Device.prototype.sendMsg = function (addr, funcCode, addrDev, num) {
    var buf = new Buffer(6);
    buf.writeUInt8(addr, 0);
    buf.writeUInt8(funcCode, 1);
    buf.writeUInt16BE(addrDev, 2);
    buf.writeUInt16BE(num, 4);

    this.write(buf);
};

// send out message
Device.prototype.response = function (buf) {
    var addr = buf[0];

    if (addr !== Config.slave.addr) {
        Utils.printRed("not for me:" + addr);
        return;
    }

    var funcCode = buf[1];
    var addrDev = buf.readUInt16BE(2);
    var num = buf.readUInt16BE(4);

    var dataBuf = new Buffer(num);

    // read from Device Register
    for (var i = 0; i < num; i++) {
        dataBuf[i] = REGISTER[funcCode][addrDev + i];
    }
    this.sendRsp(addr, funcCode, num, dataBuf);
};

module.exports = Device;