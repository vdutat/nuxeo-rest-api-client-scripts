var Nuxeo = require('nuxeo');
var util = require('util');
var fs = require('fs');
var GetOpt = require('node-getopt'); // npm install node-getopt
var Path = require('path');

var getopt = new GetOpt([
    ['c', 'config-file=ARG', 'connection config file name'],
    ['f', 'firstname=ARG', 'first name'],
    ['l', 'lastname=ARG', 'last name'],
    ['g', 'group=ARG+', 'group name (default: members)'],
    ['E', 'email=ARG', 'email'],
    ['C', 'company=ARG', 'company name'],
    ['s', 'schema=ARG+', 'schema(s) (default: user)'],
    ['e', 'enricher=ARG+', 'enricher(s)'],
    ['v', 'verbose', 'verbose mode'],
    ['h', 'help', 'display this help']
]);
getopt.setHelp(
    'Usage: node ' + Path.basename(process.argv[1]) + ' <username> <password> [OPTIONS]\n\n[[OPTIONS]]\n'
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

var docSchemas = ['user'];
if(opt.options['schema']) {
    docSchemas = opt.options['schema'];
}
var docSchemas = ['user'];
if(opt.options['schema']) {
    docSchemas = opt.options['schema'];
}
var enrichers = { document:[]};
if(opt.options['enricher']) {
    enrichers = opt.options['enricher'];
    console.log('* enrichers: ' + enrichers);
}
var nuxeo = new Nuxeo(connectInfo).schemas(docSchemas).enrichers(enrichers);
var username = opt.argv[0];
var groups = ['members'];
if(opt.options['group']) {
    groups = opt.options['group'];
}
console.log('* groups: ' + groups);
nuxeo.users().fetch(username).then(function(user) {
    console.log('* user \'' + username + '\' already exists');
    if (verbose) {
        console.log('user: ' + util.inspect(user, {depth: 6, colors: true}));
    }
}).catch(function(err) {
    // user does not exist
    var password = opt.argv[1];
    var newUser = {
        properties: {
            username: username,
            password: password,
            groups: groups
        },
    };
    if(opt.options['firstname']) {
        newUser.properties.firstName = opt.options['firstname'];
        console.log('* first name: ' + newUser.properties.firstName);
    }
    if(opt.options['lastname']) {
        newUser.properties.lastName = opt.options['lastname'];
        console.log('* last name: ' + newUser.properties.lastName);
    }
    if(opt.options['email']) {
        newUser.properties.email = opt.options['email'];
        console.log('* email: ' + newUser.properties.email);
    }
    if(opt.options['company']) {
        newUser.properties.company = opt.options['company'];
        console.log('* company: ' + newUser.properties.company);
    }
    nuxeo.users().create(newUser).then(function(user) {
        console.log('* user \'' + username + '\' created');
        if (verbose) {
            console.log('user: ' + util.inspect(user, {depth: 6, colors: true}));
        }
    }).catch(function(err) {
        console.log('! user creation: ' + err);
    });    
});
