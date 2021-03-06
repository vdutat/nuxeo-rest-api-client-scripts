function mylog(message, silentflag) {
    if (!silentflag) {
        console.log(message);
    }
}

var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt'); // npm install node-getopt
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['p', 'param=ARG+', 'provider parameters'],
    ['t', 'query-type=ARG', 'query type (default:NXQL): NXQL, pageprovider'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['r', 'repository=ARG', 'repository'],
    ['S', 'silent', 'silent mode (raw JSON)'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: node ' + Path.basename(process.argv[1]) + ' <query_or_pageprovider> [OPTIONS]\n\n[[OPTIONS]]\n'
    + '\nEx:\n'
    + 'node ' + Path.basename(process.argv[1]) + ' users_listing -t pageprovider -p "*" -s user'
);
// list all users: node nuxeo_query.js users_listing -t pageprovider -p "*" -s user

//getopt.bindHelp();
//opt = getopt.parse(process.argv.slice(2));
opt = getopt.parseSystem();
if (opt.argv.length == 0) {
    getopt.showHelp();
    process.exit(1);
}
//myinfo(opt);

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
var query = process.argv[2];

var querytype = 'nxql';
if(opt.options['query-type']) {
    querytype = opt.options['query-type'];
}
mylog('* query type: ' + querytype, silent);

mylog('* query: ' + query, silent);
var docSchemas = ['dublincore'];
if(opt.options['schema']) {
    docSchemas = opt.options['schema'];
}
mylog('* schemas: ' + docSchemas, silent);

var enrichers = { document:[]};
if(opt.options['enricher']) {
    enrichers = opt.options['enricher'];
    mylog('* enrichers: ' + enrichers, silent);
}
var repoName = 'default';
if(opt.options['repository']) {
    repoName = opt.options['repository'];
    mylog('* repository: ' + repoName, silent);
}

connectInfo.repositoryName = repoName;
var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
if (querytype == 'nxql') {
    nuxeo.repository().query({'query':query}).then(function(docs) {
        mylog('* querying ...', silent);
        if (silent) {
            mylog(JSON.stringify(docs));
        } else {
            mylog(util.inspect(docs.entries, {depth: 8, colors: true}));
        }
        mylog('* number of entries: ' + docs.entries.length, silent)
    }).catch(function(err) {
        mylog('! ' + err);
    });
} else {
    var params = [];
    if(opt.options['param']) {
        params = opt.options['param'];
    }
    mylog('* parameters: ' + params, silent);
    nuxeo.operation('Document.PageProvider').params({'providerName':query,'queryParams':params}).execute().then(function(docs) {
        mylog('* querying ...', silent);
        if (silent) {
            mylog(JSON.stringify(docs));
        } else {
            mylog(util.inspect(docs, {depth: 8, colors: true}));
        }
        mylog('* number of entries: ' + docs.entries.length, silent)
    }).catch(function(err) {
        mylog('! ' + err);
    });
}
