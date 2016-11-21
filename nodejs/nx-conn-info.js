var fs = require('fs');

var NxConnInfo = function () {};

NxConnInfo.prototype.load = function(filename) {
    var configFileName = 'localhost_config.json';
    if(filename) {
        configFileName = filename;
    }
    console.log('* config file name: ' + configFileName);
    try {
        fs.accessSync(configFileName, fs.F_OK);
    } catch (e) {
        console.log("configuration file '" + configFileName + "' does not exist");
        process.exit(2);
    }
    return JSON.parse(fs.readFileSync(configFileName));
}
exports.NxConnInfo = NxConnInfo;
