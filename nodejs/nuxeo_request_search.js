// nuxeo-js-client 0.24.0
var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt'); // npm install node-getopt
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['q', 'query=ARG', 'NXQL query'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: node ' + Path.basename(process.argv[1]) + ' <query> [OPTIONS]\n\n[[OPTIONS]]\n'
);
//getopt.bindHelp();
//opt = getopt.parse(process.argv.slice(2));
opt = getopt.parseSystem();
if (opt.argv.length == 0) {
    getopt.showHelp();
    process.exit(1);
}
//console.info(opt);
var configFileName = 'localhost_config.json';
if(opt.options['config-file']) {
    configFileName = opt.options['config-file'];
}
console.log('* config file name: ' + configFileName);
try {
    fs.accessSync(configFileName, fs.F_OK);
} catch (e) {
    console.log("configuration file '" + configFileName + "' does not exist");
    process.exit(2);
}
var connectInfo = JSON.parse(fs.readFileSync(configFileName));
var query = opt.argv[0];
//query = encodeURI(query);
console.log('* query: ' + query);
var docSchemas = ['dublincore'];
if(opt.options['schema']) {
    docSchemas = opt.options['schema'];
}
console.log('* schemas: ' + docSchemas);

var enrichers = { document:[]};
if(opt.options['enricher']) {
    enrichers = opt.options['enricher'];
    console.log('* enrichers: ' + enrichers);
}
var client = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
client
//.request('query?query=' + query).get()
.repository().query({'query':query})
.then(function(data) {
    //console.log('* executing query using JS lib (request) ...');
    console.log('* executing query ...');
    console.log(util.inspect(data, {depth: 6, colors: true}));
}).catch(function(error) {
    console.log('! query error: ' + error);
    throw error;
});

