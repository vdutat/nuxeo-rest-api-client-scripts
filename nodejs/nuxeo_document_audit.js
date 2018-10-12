function mylog(message, silent) {
    if (!silent) {
        console.log(message);
    }
}

var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt');
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['H', 'header=ARG+', 'header'],
    ['S', 'silent', 'silent mode (raw JSON)'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: node ' + Path.basename(process.argv[1]) + ' <document_path> [OPTIONS]\n\n[[OPTIONS]]\n'
);
//getopt.bindHelp();
//opt = getopt.parse(process.argv.slice(2));
opt = getopt.parseSystem();
if (opt.argv.length < 1) {
    getopt.showHelp();
    process.exit(1);
}
//console.info(opt);

var verbose = opt.options.verbose;
var silent = opt.options.silent;
var configFileName = 'localhost_config.json';
if(opt.options['config-file']) {
    configFileName = opt.options['config-file'];
}
mylog('* config file name: ' + configFileName, silent);
try {
    fs.accessSync(configFileName, fs.F_OK);
} catch (e) {
    mylog("configuration file '" + configFileName + "' does not exist", silent);
    process.exit(2);
}
var connectInfo = JSON.parse(fs.readFileSync(configFileName));

var documentPath = opt.argv[0];
mylog('* document path: ' + documentPath, silent);
var docSchemas = ['dublincore'];
if(opt.options['schema']) {
    docSchemas = opt.options['schema'];
}
mylog('* schemas: ' + docSchemas, silent);
var enrichers = { document:[]};
if(opt.options['enricher']) {
    enrichers.document = opt.options['enricher'];
    mylog('* enrichers: ' + JSON.stringify(enrichers), silent);
}
var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
nuxeo.repository().fetch(documentPath).then(function(doc) {
    mylog('* fetching document ...', silent);
    doc.fetchAudit({pageSize:0, maxResults:0}).then(function(results){
        mylog('* fetching audit ...', silent);
        if (silent) {
            mylog(JSON.stringify(results));
        } else {
            mylog(util.inspect(results, {depth: 6, colors: true}));
        }
    }).catch(function(err) {
        mylog('! ' + err + ' ' + documentPath, silent);
    });
}).catch(function(err) {
    mylog('! ' + err + ' ' + documentPath, silent);
});

