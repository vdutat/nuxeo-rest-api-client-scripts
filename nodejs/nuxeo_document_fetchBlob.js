var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt');
var Path = require('path');
var NxConnInfo = require('./nx-conn-info').NxConnInfo;

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['f', 'filename=ARG', 'file name (default:file name stored in blob)'],
    ['s', 'schema=ARG+', 'schema(s) (default: [dublincore,file])'],
    ['p', 'property=ARG', 'blob property name (default: file:content)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
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
var connectInfo = new NxConnInfo().load(opt.options['config-file']);

var documentPath = opt.argv[0];
console.log('* document path: ' + documentPath);
var docSchemas = ['dublincore', 'file'];
if(opt.options['schema']) {
    docSchemas = opt.options['schema'];
}
console.log('* schemas: ' + docSchemas);
var propertyName = 'file:content';
if(opt.options['property']) {
    propertyName = opt.options['property'];
}
var filename = '-';
if(opt.options['filename']) {
    var filename = opt.options['filename'];
} else {
}
var enrichers = { document:[]};
if(opt.options['enricher']) {
    enrichers = opt.options['enricher'];
    console.log('* enrichers: ' + enrichers);
}
var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
nuxeo.repository().fetch(documentPath).then(function(doc) {
    console.log('* fetching document ...');
    doc.fetchBlob(propertyName).then(function(resBlob) {
        console.log('* fetching blob ...');
        if (verbose) {
            console.log('resBlob: ' + util.inspect(resBlob, {depth: 6, colors: true}));
        }
        if (filename == '-') {
            filename = doc.get(propertyName).name;
        }
        var myFile = fs.createWriteStream(filename);
        myFile.on('finish', function() {
            myFile.close();
            console.log('* blob saved in ' + filename);
        });
        myFile.on('open', function(fd) {
            resBlob.body.pipe(myFile);
        });
    }).catch(function(err) {
        console.log('! fetch blob ' + util.inspect(err, {depth: 6, colors: true}));
    });
    console.log(util.inspect(doc, {depth: 6, colors: true}));
}).catch(function(err) {
    console.log('! ' + err);
});

