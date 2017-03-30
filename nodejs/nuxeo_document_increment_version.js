var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt');
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['i', 'version-increment=ARG', 'MINOR or MAJOR'],
    ['p', 'property-name=ARG', 'property to update (default: \'dc:description\'). Provide -s with schema of property if other than \'dublincore\''],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
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
console.log('* schemas: ' + docSchemas);
var enrichers = { document:[]};
if(opt.options['enricher']) {
    enrichers = opt.options['enricher'];
    console.log('* enrichers: ' + enrichers);
}
var propName = 'dc:description';
if(opt.options['property-name']) {
    propName = opt.options['property-name'];
    console.log('* property name: ' + propName);
}
var increments = ['MINOR', 'MAJOR', 'NONE'];
var increment = 'MINOR';
if(opt.options['version-increment'] && increments.indexOf(opt.options['version-increment']) > -1) {
    increment = opt.options['version-increment'];
    console.log('* version increment: ' + increment);
}
var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
//nuxeo.header('depth', 'max');
nuxeo.repository().fetch(documentPath).then(function(doc) {
    console.log('* fetching ...');
    if (verbose) {
        console.log(util.inspect(doc, {depth: 6, colors: true}));
    }
    var prop = (doc.get(propName) || '') + ' ';
    console.log('* ' + propName + ': "' + prop + '"');
    var newProp = {};
    newProp[propName] = prop;
    doc.set(newProp).save({'headers': {'X-Versioning-Option': increment}}).then(function(updatedDoc) {
        console.log('* fetching document after update ...');
        console.log('* version: ' + updatedDoc.get('uid:major_version') + '.' + updatedDoc.get('uid:minor_version'));
        if (verbose) {
            console.log(util.inspect(updatedDoc, {depth: 6, colors: true}));
        }
    }).catch(function(err) {
        console.log('! save error: ' + err);
    });
}).catch(function(err) {
    console.log('! fetch error: ' + err);
});

