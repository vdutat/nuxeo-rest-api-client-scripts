var usage = 'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <query> [<comma-separated schemas>] [<comma-separated enrichers>]'
if (process.argv.length < 3) {
    console.log(usage);
    process.exit(1);
}

var nuxeo = require('nuxeo');
var util = require('util');
var connectInfo = {
    baseURL:'http://localhost:8080/nuxeo',
    auth: {
        username: 'Administrator',
        password: 'Administrator'
    }
}
var query = process.argv[2];
console.log('* query: ' + query);
var docSchemas = ['dublincore'];
if (process.argv.length > 3) {
    docSchemas = process.argv[3].split(',');
    connectInfo.schemas = docSchemas;
}
console.log('* schemas: ' + docSchemas);

var client = new nuxeo.Client(connectInfo);
client.connect(function(error, client) {
    if (error) {
        // cannot connect
        throw error;
    }
    // OK, the returned client is connected
    //console.log('* Client is connected: ' + client.connected);
});
if (process.argv.length > 4) {
    enrichers = process.argv[4].split(',');
    client.header('X-NXenrichers.document', enrichers);
}
if (process.argv.length > 4) {
    console.log('* enrichers: ' + enrichers);
}
//query = encodeURI(query);
//console.log('* query: ' + query);

/************REST API ***************/
/*
client.request('path/default-domain/@search/?query=' + query).get(function(error, data) {
    console.log('* 2 executing query using REST API (request) ...');
    if (error) {
      throw error;
    }
    console.log(util.inspect(data, {depth: 4, colors: true}));
});
*/
/***************************/
client.request('/').schemas(docSchemas).path('@search').query({'query':query}).execute(function(error, data) {
    console.log('* executing query using JS lib (request) ...');
    if (error) {
      throw error;
    }
    console.log(util.inspect(data, {depth: 6, colors: true}));
});

