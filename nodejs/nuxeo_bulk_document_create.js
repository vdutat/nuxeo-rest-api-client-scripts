// nuxeo-js-client 0.24.0
var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt');
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['n', 'nbr-docs=ARG', 'number of documents to create (default: 10)'],
    ['t', 'doc-type=ARG', 'document type (default: File)'],
    ['p', 'doc-name-pfx=ARG', 'document name prefix (default: \'Doc \')'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: node ' + Path.basename(process.argv[1]) + ' <parent_document_path> [OPTIONS]\n\n[[OPTIONS]]\n'
);
//getopt.bindHelp();
//opt = getopt.parse(process.argv.slice(2));
opt = getopt.parseSystem();
if (opt.argv.length == 0) {
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
var parentDocumentPath = opt.argv[0];
console.log('* parent document path: ' + parentDocumentPath);
var nbrDocuments = 10;
if(opt.options['nbr-docs']) {
    nbrDocuments = opt.options['nbr-docs'];
}
console.log('* number of documents to create: ' + nbrDocuments);
var docType = 'File';
if(opt.options['doc-type']) {
    docType = opt.options['doc-type'];
}
console.log('* document type: ' + docType);
var baseDocumentName = 'Doc ';
if(opt.options['doc-name-pfx']) {
    baseDocumentName = opt.options['doc-name-pfx'];
}
console.log('* document name prefix: ' + baseDocumentName);
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

var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
nuxeo.repository().fetch(parentDocumentPath).then(function(folder) {
    console.log('* fetching parent document ...');
    if (verbose) {
        console.log(util.inspect(folder, {depth: 6, colors: true}));
    }
    console.log('* parent document fetched: ' + folder.path);
    for (i = 0; i < nbrDocuments; i++) {
        var documentName = baseDocumentName + i;
        var newDoc = {
            'entity-type': 'document',
            type: docType,
            name: documentName,
            properties: {'dc:title': documentName, 'dc:description': 'A Simple ' + docType }
        };
        nuxeo.repository().create(folder.path, newDoc).then(function(doc) {
            console.log('* Created ' + doc.type + ' - ' + doc.path)
            if (verbose) {
                console.log(util.inspect(doc, {colors: true}));
            }
        }).catch(function(err) {
            console.log('! document creation: ' + err);
        });
        /*
        if ((i % 30) == 0) {
            setTimeout(function(){ console.log('* sleeping');}, 500);
        }
        */
    }
}).catch(function(err) {
    console.log('! fetch parent folder:' + err);
});
