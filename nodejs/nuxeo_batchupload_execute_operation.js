// node nuxeo_batchupload_execute_operation.js /default-domain/workspaces/SUPNXP-18938/SUPNXP-18938-1 blank1.pdf blank2.pdf -p files:files -c ../localhost_config.json -v
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
    ['p', 'property=ARG', 'blob property name (default: file:content)'],
    ['o', 'operation=ARG', 'operation ID to attach blob(s) (default: Blob.AttachOnDocument)'],
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
var propertyName = 'file:content';
if(opt.options['property']) {
    propertyName = opt.options['property'];
}
console.log('* property name: ' + propertyName);
var operationId = 'Blob.AttachOnDocument';
if(opt.options['operation']) {
    operationId = opt.options['operation'];
}
console.log('* operation ID: ' + operationId);
var connectInfo = JSON.parse(fs.readFileSync(configFileName));
var documentPath = opt.argv[0];
console.log('* document path: ' + documentPath);
var blobs = [];
if (opt.argv.length > 1) {
    var i =1;
    for (i = 1; i < opt.argv.length; i++) {
        var blobFileName = opt.argv[i];
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
        blobs.push(blob);
    }
}
console.log('* # of blobs to upload: ' + blobs.length);
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

var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
nuxeo.repository().fetch(documentPath).then(function(doc) {
    console.log('* document fetched: ' + doc.path)
    if (verbose) {
        console.log(util.inspect(doc, {depth: 6, colors: true}));
    }
    if (blobs.length > 1) {
        console.log('* uploading blobs ...');
        nuxeo.batchUpload().upload(blobs).then(function(res) {
            // res.blob instanceof Nuxeo.BatchBlob
            if (verbose) {
                console.log('* dump res.batch ...');
                console.log(util.inspect(res.batch, {depth: 6, colors: true}));
                console.log('* dump res.blobs ...');
                console.log(util.inspect(res.blobs, {depth: 6, colors: true}));
            }
            console.log('* attaching blobs to document ...');
            var reqParams = {};
            reqParams.body = {};
            reqParams.body.params = {};
            reqParams.body.context = {};
            reqParams.body.params['document'] = doc.path;
            reqParams.body.params['xpath'] = propertyName;
            if (verbose) {
                console.log('* batch ID: ' + res.blobs[0]['upload-batch']);
                console.log(util.inspect(reqParams, {depth: 6, colors: true}));
            }
            nuxeo.request('upload/' + res.blobs[0]['upload-batch'] + '/execute/' + operationId)
                .post(reqParams).then(function(data) {
                if (verbose) {
                    console.log(util.inspect(data, {depth: 6, colors: true}));
                }
            }).catch(function(error) {
                console.log('! batch attach: ' + error);
            });
        })
        .catch(function(error) {
            console.log('! batch upload: ' + error);
        });
    } else if (blobs.length > 0) {
        console.log('* uploading blob ...');
        nuxeo.batchUpload().upload(blobs[0]).then(function(res) {
            // res.blob instanceof Nuxeo.BatchBlob
            if (verbose) {
                console.log('* dump res.batch ...');
                console.log(util.inspect(res.batch, {depth: 6, colors: true}));
                console.log('* dump res.blob ...');
                console.log(util.inspect(res.blob, {depth: 6, colors: true}));
            }
            console.log('* attaching blob to document ...');
            var reqParams = {};
            reqParams.params = {};
            reqParams.context = {};
            reqParams.params['document'] = doc.path;
            reqParams.params['xpath'] = propertyName;
            if (verbose) {
                console.log('* batch ID: ' + res.blob['upload-batch']);
                console.log(util.inspect(reqParams, {depth: 6, colors: true}));
            }
            nuxeo.request('upload/' + res.blob['upload-batch'] + '/execute/' + operationId)
                .header('Content-Type', 'application/json')
                .schemas(['dublincore', 'files'])
                .post(reqParams).then(function(data) {
                if (verbose) {
                    console.log(util.inspect(data, {depth: 6, colors: true}));
                }
            }).catch(function(error) {
                console.log('! batch attach: ' + error);
            });
        })
        .catch(function(error) {
            console.log('! batch upload: ' + error);
        });
    }
}).catch(function(err) {
    console.log('! fetch document: ' + err);
});

