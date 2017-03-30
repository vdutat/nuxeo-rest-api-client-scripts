function mylog(message, silent) {
    if (!silent) {
        console.log(message);
    }
}

var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt'); // npm install node-getopt
var Mime = require('mime-types');
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['m', 'mime-type=ARG', 'blob MIME type'],
    ['p', 'property=ARG', 'blob property name (default: file:content)'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['S', 'silent', 'silent mode (raw JSON)'],
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
var silent = opt.options.silent;
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
mylog('* document path: ' + docpath, silent);
var blobFileName = opt.argv[1];
mylog('* filename: ' + blobFileName, silent);
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
mylog('* MIME type: ' + mimetype, silent);
var filestats = fs.statSync(blobFileName);
mylog('* file size: ' + filestats['size'], silent);
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
mylog('* schemas: ' + docSchemas, silent);
var propertyName = 'file:content';
if(opt.options['property']) {
    propertyName = opt.options['property'];
}

var enrichers = { document:[]};
if(opt.options['enricher']) {
    enrichers = opt.options['enricher'];
    mylog('* enrichers: ' + enrichers, silent);
}
var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
nuxeo.repository().fetch(docpath).then(function(doc) {
    mylog('* fetching document ...', silent);
    if (!silent && verbose) {
        console.log(util.inspect(doc, {depth: 6, colors: true}));
    }
    mylog('* document fetched: ' + doc.path, silent);
    mylog('* uploading blob ...', silent);
    if (!silent && verbose) {
        mylog(util.inspect(blob, {depth: 6, colors: true}));
    }
    nuxeo.batchUpload().upload(blob).then(function(res) {
        // res.blob instanceof Nuxeo.BatchBlob
        mylog('* attaching blob to document ...', silent);
        if (!silent && verbose) {
            mylog(util.inspect(res.blob, {depth: 6, colors: true}));
        }
        nuxeo.operation('Blob.AttachOnDocument')
            .params({'document': doc.path, 'xpath': propertyName})
            .input(res.blob)
            .execute().then(function(ret) {
            if (verbose) {
                mylog(util.inspect(ret, {depth: 6, colors: true}));
            }
            mylog('* blob attached', silent);
        }).catch(function(error) {
            console.log('! batch attach: ' + error);
        });
    }).catch(function(error) {
        console.log('! batch upload: ' + error);
    });
}).catch(function(err) {
    console.log('! fetch document:' + err);
});
