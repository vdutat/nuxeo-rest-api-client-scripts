var usage = 'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <docpath> [<comma-separated schemas>] [<comma-separated enrichers>]'
if (process.argv.length < 2) {
    console.log(usage);
    process.exit(1);
}
// nuxeo-js-client 0.24.0
var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');

var configFileName = 'localhost_config.json';
if(process.env.CONF_FILE) {
    configFileName = process.env.CONF_FILE;
}
try {
    fs.accessSync(configFileName, fs.F_OK);
} catch (e) {
    console.log("configuration file '" + configFileName + "' does not exist");
    process.exit(2);
}
var connectInfo = JSON.parse(fs.readFileSync(configFileName));
var documentPath = '/';
if (process.argv.length >= 2) {
    documentPath = process.argv[2];
}
console.log('* document path: ' + documentPath);
var docSchemas = ['dublincore'];
if (process.argv.length > 3) {
    docSchemas = process.argv[3].split(',');
    //connectInfo.schemas = docSchemas;
}
console.log('* schemas: ' + docSchemas);
var enrichers = { document:[]};
if (process.argv.length > 4) {
    enrichers['document'] = process.argv[4].split(',');
    console.log('* enrichers: ' + enrichers);
}

var nuxeo = new Nuxeo(connectInfo);
nuxeo.operation('Workflow.UserTaskPageProvider')
    .params({
        pageSize:0
    })
    .input(documentPath).execute().then(function(doc) {
    console.log('* Retrieving user tasks ...');
    console.log(util.inspect(doc, {depth: 6, colors: true}));
}).catch(function(err) {
    console.log('! ' + err);
});

