"use strict";
var EventEmitter = require("events");
var util = require("util");
var Utils = require("./utils");
var ADDR_MIN = 1;
var ADDR_MAX = 247;

var STATE_IDLE = 0;
// var STATE_ADDR_DEV = 10;
var STATE_FUNC = 11;
var STATE_NUM = 12;
var STATE_NUM2 = 121;
var STATE_ADDR = 13;
var STATE_ADDR2 = 14;
var STATE_CRC = 15;
var STATE_CRC2 = 16;
var STATE_DATA = 17;

var mBuffer = (function (len) {
    var index = 0;
    var buffer = new Buffer(len);
    var counterData = 0;

    return {
        getMaxLen: function () {
            return len;
        },
        getPos: function () {
            return index;
        },
        addByte: function (b) {
            buffer[index++] = b;
        },
        bOver: function () {
            return (index >= len);
        },
        reset: function () {
            index = 0;
        },
        getBuffer: function () {
            return buffer.slice(0, index);
        },
        getCounterData: function () {
            return counterData;
        },
        incCounterData: function () {
            counterData++;
        },
        decCounterData: function () {
            counterData--;
        },
        setCounterData: function (num) {
            counterData = num;
        }
    };
})(260);


function Protocol() {
    EventEmitter.call(this);
    this._state = STATE_IDLE;

    console.log("protocol buffer len:", mBuffer.getMaxLen());
}
util.inherits(Protocol, EventEmitter);

Protocol.prototype.parseResponse = function (data) {
    for (var i = 0; i < data.length; i++) {
        this.parseResponseByte(data[i], mBuffer);
    }
};

Protocol.prototype.parse = function (data) {
    for (var i = 0; i < data.length; i++) {
        this.parseByte(data[i], mBuffer);
    }
};
Protocol.prototype.parseResponseByte = function (b, buf) {
    switch (this._state) {
        case STATE_IDLE:
            if (b >= ADDR_MIN && b <= ADDR_MAX) {
                buf.addByte(b);
                this._state = STATE_FUNC;
            }
            break;
        case STATE_FUNC:
            if (b === 1 ||
                b === 2 ||
                b === 3 ||
                b === 4 ||
                b === 5 ||
                b === 6 ||
                b === 7
            ) {
                console.log("Func code:", b);
                buf.addByte(b);
                this._state = STATE_NUM;
            } else {
                console.log("Unsupported func code:" + b);
                buf.reset();
                this._state = STATE_IDLE;
            }
            break;
        case STATE_NUM:
            buf.addByte(b);
            this._state = STATE_DATA;
            buf.setCounterData(b);
            break;
        case STATE_DATA:
            buf.addByte(b);
            buf.decCounterData();
            if (buf.getCounterData() === 0) {
                this._state = STATE_CRC;
            }

            break;
        case STATE_CRC:
            buf.addByte(b);
            this._state = STATE_CRC2;
            break;
        case STATE_CRC2:
            buf.addByte(b);
            // check CRC
            this.handleResponseMsg(buf);
            // if (buf.getPos() === 8) {
            //     this.handleMsg(buf);
            // } else {
            //     console.log("Wrong msg length:");
            // }

            // console.log("Received a whole packet:", buf.getPos());
            buf.reset();
            this._state = STATE_IDLE;
            break;
        default:
            console.log("Unknown state", this._state);
            this._state = STATE_IDLE;
            break;
    }

};
Protocol.prototype.parseByte = function (b, buf) {
    // console.log(b.toString("16"));

    switch (this._state) {
        case STATE_IDLE:
            if (b >= ADDR_MIN && b <= ADDR_MAX) {
                buf.addByte(b);
                this._state = STATE_FUNC;
            }
            break;
            // case STATE_ADDR_DEV:
            //     break;
        case STATE_FUNC:
            if (b === 1 ||
                b === 2 ||
                b === 3 ||
                b === 4 ||
                b === 5 ||
                b === 6 ||
                b === 7
            ) {
                console.log("Func code:", b);
                buf.addByte(b);
                this._state = STATE_ADDR;
            } else {
                console.log("Unsupported func code:" + b);
                buf.reset();
                this._state = STATE_IDLE;
            }
            break;
        case STATE_ADDR:
            buf.addByte(b);
            this._state = STATE_ADDR2;
            break;
        case STATE_ADDR2:
            buf.addByte(b);
            this._state = STATE_NUM;
            break;
        case STATE_NUM:
            buf.addByte(b);
            this._state = STATE_NUM2;
            break;
        case STATE_NUM2:
            buf.addByte(b);
            this._state = STATE_CRC;
            break;
        case STATE_CRC:
            buf.addByte(b);
            this._state = STATE_CRC2;
            break;
        case STATE_CRC2:
            buf.addByte(b);
            // check CRC
            if (buf.getPos() === 8) {
                this.handleMsg(buf);
            } else {
                console.log("Wrong msg length:");
            }

            // console.log("Received a whole packet:", buf.getPos());
            buf.reset();
            this._state = STATE_IDLE;
            break;
        default:
            console.log("Unknown state", this._state);
            this._state = STATE_IDLE;
            break;
    }
};
Protocol.prototype.handleMsg = function (buf) {
    var rxBuf = buf.getBuffer();
    Utils.printGreen("RX msg:" + rxBuf.length);
    console.log(rxBuf);
    var crcValue = this.crc16(rxBuf.slice(0, 6));
    console.log("Calculated CRC:",
        crcValue.toString("16"));

    var crcBuffer = new Buffer(2);
    crcBuffer.writeUInt16LE(crcValue, 0);

    console.log("RX CRC:", rxBuf[7].toString("16"), rxBuf[6].toString("16"));

    if (crcBuffer[0] === rxBuf[6] && crcBuffer[1] === rxBuf[7]) {
        console.log("CRC check --> OK");

        this.emit("message", rxBuf.slice(0, 6));
    } else {
        Utils.printRed("CRC check --> Fail");
    }
};
Protocol.prototype.handleResponseMsg = function (buf) {
    var rxBuf = buf.getBuffer();
    Utils.printGreen("RX msg:" + rxBuf.length);
    console.log(rxBuf.toString("hex"));

};
Protocol.prototype.crc16 = function (buffer) {
    var crc = 0xFFFF;
    var odd;

    for (var i = 0; i < buffer.length; i++) {
        crc ^= buffer.readUInt8(i);

        for (var j = 0; j < 8; j++) {
            odd = crc & 0x0001;
            crc >>= 1;
            if (odd) {
                crc ^= 0xA001;
            }
        }
    }

    return crc;
};
Protocol.prototype.DEF = {
    FUNC_READ_COIL: 1,
    FUNC_READ_INPUT: 2,
};
Protocol.prototype.encode = this.crc16;

module.exports = Protocol;