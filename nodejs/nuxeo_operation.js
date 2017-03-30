var usage = 'Usage: ' + process.argv[0] + ' ' + process.argv[1] + " <docpath> <operation> [<comma-separated schemas>] [<comma-separated enrichers>]\nEx: \nNuxeo_REST_Document_call_operation.sh / UserManager.ExportGroups blob\nNUXEO_REPOSITORY=secondrepo OP_PARAMS=\"\\\"query\\\":\\\"SELECT \* FROM DefaultRelation\\\"\" Nuxeo_REST_Document_call_operation.sh / Repository.Query\nOP_PARAMS=\"\\\"name\\\":\\\"ScanIngestionStart\\\"\" Nuxeo_REST_Document_call_operation.sh / Event.Fire\nOP_PARAMS=\"\\\"query\\\":\\\"SELECT AVG(dss:innerSize) FROM Document WHERE ecm:isProxy = 0 AND ecm:isCheckedInVersion = 0 AND ecm:currentLifeCycleState <> 'deleted'\\\"\" node nuxeo_operation.js / Repository.ResultSetQuery\n";
// nuxeo-js-client 0.24.0
var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt');
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['o', 'output-type=ARG', 'operation output type (\'json\' or \'blob\', default: json)'],
    ['p', 'params=ARG', 'operation parameters\' JSON'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['r', 'repository=ARG', 'repository'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: node ' + Path.basename(process.argv[1]) + ' <document_path> <operation> [OPTIONS]\n\n[[OPTIONS]]\n'
    + '\nExecutes an automation operation/chain with parameters.'
    + 'Ex: \nnode ' + Path.basename(process.argv[1]) + " / Event.Fire -p \"\\\"name\\\":\\\"ScanIngestionStart\\\"\"\n"
    + 'node ' + Path.basename(process.argv[1]) + " / UserManager.ExportGroups -o blob\n"
    + 'node ' + Path.basename(process.argv[1]) + " / Repository.Query -p \"\\\"query\\\":\\\"SELECT \* FROM DefaultRelation\\\"\""
    + '\n'
);
//getopt.bindHelp();
//opt = getopt.parse(process.argv.slice(2));
opt = getopt.parseSystem();
if (opt.argv.length < 2) {
    getopt.showHelp();
    process.exit(1);
}
//console.info(opt);

var verbose = opt.options.verbose;
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

var documentPath = opt.argv[0];
console.log('* document path: ' + documentPath);

var opName = opt.argv[1];
console.log('* operation name: ' + opName);

var opParams = {};
if(opt.options['params']) {
    opParams = JSON.parse("{" + opt.options['params'] + "}");
}
console.log('* operation parameters: ' + util.inspect(opParams, {depth: 6, colors: true}));

var outputType = 'json';
if(opt.options['output-type']) {
    outputType = opt.options['output-type'];
    console.log('* output type: ' + outputType);
}

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
var repoName = 'default';
if(opt.options['repository']) {
    repoName = opt.options['repository'];
    console.log('* repository: ' + repoName);
}

connectInfo.repositoryName = repoName;
var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
nuxeo.operation(opName).params(opParams).input(documentPath)
.execute()
//.execute({ schemas: docSchemas})
.then(function(doc) {
    console.log('* Executing operation ...');
    if (verbose) {
        if (outputType == "blob") {
            console.log(util.inspect(doc.body, {depth: 6, colors: true}));
        } else {
            console.log(util.inspect(doc, {depth: 6, colors: true}));
        }
    }
}).catch(function(err) {
    console.log('! ' + err);
});

