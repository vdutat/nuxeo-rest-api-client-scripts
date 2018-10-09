function mylog(message, silent) {
    if (!silent) {
        console.log(message);
    }
}
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
    ['H', 'header=ARG+', 'header'],
    ['r', 'repository=ARG', 'repository'],
    ['S', 'silent', 'silent mode (raw JSON)'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: node ' + Path.basename(process.argv[1]) + ' <document_path> <operation> [OPTIONS]\n\n[[OPTIONS]]\n'
    + '\nExecutes an automation operation/chain with parameters.'
    + 'Ex: \nnode ' + Path.basename(process.argv[1]) + " / Event.Fire -p \"\\\"name\\\":\\\"ScanIngestionStart\\\"\"\n"
    + 'node ' + Path.basename(process.argv[1]) + " / UserManager.ExportGroups -o blob\n"
    + 'node ' + Path.basename(process.argv[1]) + " / Repository.Query -p \"\\\"query\\\":\\\"SELECT \* FROM DefaultRelation\\\"\"" + "\n"
    + 'node ' + Path.basename(process.argv[1])+ " / Repository.ResultSetQuery -p \"\\\"query\\\":\\\"SELECT COUNT(ecm:uuid) FROM Document\\\"\" -v" + "\n"
    + 'node ' + Path.basename(process.argv[1])+ " / Repository.ResultSetQuery -p \"\\\"query\\\":\\\"SELECT AVG(dss:innerSize) FROM Document WHERE ecm:isProxy = 0 AND ecm:isCheckedInVersion = 0 AND ecm:currentLifeCycleState <> 'deleted'\\\"\" -v" + "\n"
    + 'node ' + Path.basename(process.argv[1]) + " /default-domain/workspaces/SUPNXP-22722 Document.RemovePermission -p \"\\\"id\\\":\\\"ReadWrite\\\",\\\"user\\\":\\\"vdu1\\\",\\\"acl\\\":\\\"local\\\"\" -e \"acls\" -H \"Nuxeo-Transaction-Timeout:3600\"" + "\n"
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
var documents = [];
if(documentPath.indexOf(',') > -1) {
    documents = documentPath.split(',');
} else {
    documents.push(documentPath);
}
mylog('* document path: ' + documentPath, silent);
mylog('* document paths: ' + documents, silent);

var opName = opt.argv[1];
mylog('* operation name: ' + opName, silent);

var opParams = {};
if(opt.options['params']) {
    opParams = JSON.parse("{" + opt.options['params'] + "}");
}
mylog('* operation parameters: ' + util.inspect(opParams, {depth: 6, colors: true}), silent);

var outputType = 'json';
if(opt.options['output-type']) {
    outputType = opt.options['output-type'];
    mylog('* output type: ' + outputType, silent);
}

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
var reqHeaders = [];
if(opt.options['header']) {
    reqHeaders = opt.options['header'];
    mylog('* headers: ' + JSON.stringify(reqHeaders), silent);
}
var repoName = 'default';
if(opt.options['repository']) {
    repoName = opt.options['repository'];
    mylog('* repository: ' + repoName, silent);
}

connectInfo.repositoryName = repoName;
var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas)
//.transactionTimeout(901000)
.enrichers(enrichers);
for (var i in reqHeaders) {
    var headerArray = reqHeaders[i].split(':');
    nuxeo.header(headerArray[0], headerArray[1]);
}
nuxeo.operation(opName).params(opParams).input(documentPath)
.execute()
//.execute({ schemas: docSchemas})
.then(function(doc) {
    mylog('* Executing operation ...', silent);
    if (silent) {
        mylog(JSON.stringify(doc));
    } else {
        if (outputType == "blob") {
            mylog(util.inspect(doc.body, {depth: 6, colors: true}), silent);
            // TODO write blob to file
        } else {
            mylog(util.inspect(doc, {depth: 6, colors: true}), silent);
        }
    }
}).catch(function(err) {
    mylog('! ' + err, silent);
});

