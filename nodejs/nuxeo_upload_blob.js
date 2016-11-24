var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt'); // npm install node-getopt
var Mime = require('mime-types');
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['m', 'mime-type=ARG', 'blob MIME type'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: node ' + Path.basename(process.argv[1]) + ' <docpath> <filename> [OPTIONS]\n\n[[OPTIONS]]\n'
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
var docpath = opt.argv[0];
console.log('* document path: ' + docpath);
var blobFileName = opt.argv[1];
console.log('* filename: ' + blobFileName);
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
    content: fs.createReadStream(blobFileName),
    name: Path.basename(blobFileName),
    mimeType: mimetype,
    size: filestats['size']
});
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
nuxeo.repository().fetch(docpath).then(function(doc) {
    console.log('* fetching document ...');
    if (verbose) {
        console.log(util.inspect(doc, {depth: 6, colors: true}));
    }
    console.log('* document fetched: ' + doc.path);
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
        }).catch(function(error) {
            console.log('! batch attach: ' + error);
        });
    }).catch(function(error) {
        console.log('! batch upload: ' + error);
    });
}).catch(function(err) {
    console.log('! fetch document:' + err);
});
