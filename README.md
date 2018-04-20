# Readme
Used to simulate one Modbus device on computer

## Usage
```
// modify config.js to enter the uart port path, slave addr
// and baudrate

{
    "protocol": "modbus",

    "baudRate": 9600,
    "master": {
        "period": 5000,
        "addrLst": [80, 10, 30],
        "portName": "/dev/tty.wchusbserial142410"
    },
    "slave": {
        "addr": 80,
        "portName": "/dev/tty.wchusbserial142430"
    }

}



node index.js 1 // run as master

node index.js 0 // run as a slave device

```