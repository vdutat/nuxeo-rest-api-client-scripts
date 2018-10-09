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
    ['p', 'properties=ARG', 'properties\' JSON'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['S', 'silent', 'silent mode (raw JSON)'],
    ['v', 'verbose', 'verbose mode'],
    ['u', 'user=ARG', 'user name'],
    ['P', 'password=ARG', 'password'],
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
    console.log("configuration file '" + configFileName + "' does not exist");
    process.exit(2);
}
var connectInfo = JSON.parse(fs.readFileSync(configFileName));
if(opt.options['user']) {
    connectInfo.auth.username = opt.options['user'];
}
if(opt.options['password']) {
    connectInfo.auth.password = opt.options['password'];
}
//console.log(util.inspect(connectInfo, {depth: 6, colors: true}));
var documentPath = opt.argv[0];
mylog('* document path: ' + documentPath, silent);
var docSchemas = [];
if(opt.options['schema']) {
    docSchemas = opt.options['schema'];
}
if (docSchemas.indexOf('dublincore') == -1) {
    docSchemas.push('dublincore');
}
if (docSchemas.indexOf('uid') == -1) {
    docSchemas.push('uid');
}
mylog('* schemas: ' + docSchemas, silent);
var enrichers = { document:[]};
if(opt.options['enricher']) {
    enrichers = opt.options['enricher'];
    mylog('* enrichers: ' + enrichers, silent);
}
var props = {};
if(opt.options['properties']) {
    props = JSON.parse("{" + opt.options['properties'] + "}");
//} else if (docType == "File") {
//    props = {'dc:title': documentName, 'dc:description': 'Created with ' + process.argv[1] }
}
mylog('* properties: ' + util.inspect(props, {depth: 6, colors: true}), silent);
var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
nuxeo.repository().fetch(documentPath).then(function(doc) {
    mylog('* fetching ...', silent);
    if (verbose) {
        mylog(util.inspect(doc, {depth: 6, colors: true}), silent);
    }
    doc.set(props).save().then(function(updatedDoc) {
        mylog('* fetching document after update ...', silent);
        if (verbose) {
            mylog(util.inspect(updatedDoc, {depth: 6, colors: true}), silent);
        }
    }).catch(function(err) {
        console.log('! save error: ' + err);
    });
}).catch(function(err) {
    console.log('! fetch error: ' + err);
});

