var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt'); // npm install node-getopt
var Mime = require('mime-types');
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['t', 'doc-type=ARG', 'document type (default: File)'],
    ['m', 'mime-type=ARG', 'blob MIME type'],
    ['p', 'properties=ARG', 'properties\' JSON'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: node ' + Path.basename(process.argv[1]) + ' <parent_document_path> <document_name> [<blob_filename>] [OPTIONS]\n\n[[OPTIONS]]\n'
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
var documentName = opt.argv[1];
console.log('* document name: ' + documentName);
var blob = null;
if (opt.argv.length > 2) {
    var blobFileName = opt.argv[2];
    console.log('* blob file name: ' + blobFileName);
    try {
        fs.accessSync(blobFileName, fs.F_OK);
    } catch (e) {
        console.log("blob file '" + blobFileName + "' does not exist");
        process.exit(3);
    }
    var mimetype = Mime.lookup(blobFileName);
    if(opt.options['mime-type']) {
        mimetype = opt.options['mime-type'];
    }
    console.log('* MIME type: ' + mimetype);
    var filestats = fs.statSync(blobFileName);
    console.log('* file size: ' + filestats['size']);
    var blob = new Nuxeo.Blob({
        content: fs.readFileSync(blobFileName),
        name: Path.basename(blobFileName),
        mimeType: mimetype,
        size: filestats['size']
    });
}
var docType = 'File';
if(opt.options['doc-type']) {
    docType = opt.options['doc-type'];
}
console.log('* document type: ' + docType);
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
var props = {};
if(opt.options['properties']) {
    props = JSON.parse("{" + opt.options['properties'] + "}");
//} else if (docType == "File") {
//    props = {'dc:title': documentName, 'dc:description': 'Created with ' + process.argv[1] }
}
console.log('* properties: ' + util.inspect(props, {depth: 6, colors: true}));

var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
nuxeo.repository().fetch(parentDocumentPath).then(function(folder) {
    console.log('* fetching parent document ...');
    if (verbose) {
        console.log(util.inspect(folder, {depth: 6, colors: true}));
    }
    console.log('* parent document fetched: ' + folder.path);
    var newDoc = {
        'entity-type': 'document',
        type: docType,
        name: documentName,
        properties: props
    };
    nuxeo.repository().create(folder.path, newDoc).then(function(doc) {
        console.log('* Created ' + doc.type + ' - ' + doc.path)
        if (verbose) {
            console.log(util.inspect(doc, {depth: 6, colors: true}));
        }
        if (blob != null) {
            console.log('* uploading blob ...');
            nuxeo.batchUpload().upload(blob).then(function(res) {
                // res.blob instanceof Nuxeo.BatchBlob
                if (verbose) {
                    console.log(util.inspect(res.blob, {depth: 6, colors: true}));
                }
                console.log('* attaching blob to document ...');
                nuxeo.operation('Blob.AttachOnDocument')
                    .params({'document': doc.path})
                    .input(res.blob)
                    .execute().then(function(ret) {
                    if (verbose) {
                        console.log(util.inspect(ret, {depth: 6, colors: true}));
                    }
                    console.log('* blob attached');
                    /*
                    nuxeo.repository().fetch(doc.path).then(function(doc){
                        doc.fetchBlob().then(function(resBlob){
                            if (verbose) {
                                console.log('resBlob: ' + util.inspect(resBlob.body, {depth: 6, colors: true}));
                            }
                        });
                    }).catch(function(err){});
                    */
                })
                .catch(function(error) {
                    console.log('! batch attach: ' + error);
                });
            })
            .catch(function(error) {
                console.log('! batch upload: ' + error);
            });
        }
    }).catch(function(err) {
        console.log('! document creation: ' + err);
        if (verbose) {
            console.log('! error status: ' + err.response.status);
            console.log(util.inspect(err.response, {depth: 8, colors: true}));
        }
    });
}).catch(function(err) {
    console.log('! fetch parent folder:' + err);
});

