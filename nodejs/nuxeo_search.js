#!/usr/bin/env node

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
    ['a', 'aggregate=ARG+', 'aggaregate(s) as URL parameters, values in JSON format (array)'],
    ['t', 'query-type=ARG', 'query type (default:NXQL): NXQL, pageprovider'],
    ['s', 'schema=ARG+', 'schema(s) (default: dublincore)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['r', 'repository=ARG', 'repository'],
    ['S', 'silent', 'silent mode (raw JSON)'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: ' + Path.basename(process.argv[1]) + ' <query_or_pageprovider> [OPTIONS]\n\n[[OPTIONS]]\n'
    + '\nExecutes NXQL query or page provider. Comptible with Nuxeo LTS 2016 and up\n'
    + '\nEx:\n'
    + Path.basename(process.argv[1]) + ' users_listing -t pageprovider -p "*" -s user (list all users)'
    + Path.basename(process.argv[1]) + ' SUPNXP-19660 -t pageprovider -a "SUPNXP-19660_pp%3Adublincore_source_agg=%5B%22source1%22%5D&SUPNXP-19660_pp%3Adublincore_rights_agg=%5B%22rights1%22%5D" (executes page provider with aggregates)'
    + '\n'
);
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

var querytype = 'NXQL';
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
var requestParams = {};
var params = [];
if(opt.options['param']) {
    params = opt.options['param'];
    mylog('* parameters: ' + params, silent);
}
var aggregate = '';
if(opt.options['aggregate']) {
    aggregate = opt.options['aggregate'];
    mylog('* aggregate: ' + aggregate, silent);
}
var requestUrl = 'search/pp/' + query + '/execute';
if (querytype != 'pageprovider') {
    requestUrl = 'search/lang/' + querytype + '/execute';
    requestParams = {'query':query, 'queryParams':params};
} else {
    requestUrl += '?' + aggregate;
}
nuxeo.request(requestUrl).queryParams(requestParams).execute().then(function(docs) {
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

