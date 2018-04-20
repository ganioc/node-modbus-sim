function printCust(option, str) {
    console.log(option, str);
}

function print(str) {
    // const filename = path.basename(__filename);
    console.log(str);
}
exports.printRed = function (str) {
    printCust("\x1b[31m%s\x1b[0m", str);
};
exports.printBlue = function (str) {
    printCust("\x1b[34m%s\x1b[0m", str);
};
exports.printYellow = function (str) {
    printCust("\x1b[33m%s\x1b[0m", str);
};
exports.printGreen = function (str) {
    printCust("\x1b[32m%s\x1b[0m", str);
};
exports.printMagenta = function (str) {
    printCust("\x1b[35m%s\x1b[0m", str);
};
exports.printBlink = function (str) {
    printCust("\x1b[5m%s\x1b[0m", str);
};