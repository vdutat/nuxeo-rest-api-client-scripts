var usage = 'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <query> [<comma-separated schemas>] [<comma-separated enrichers>]'
if (process.argv.length < 3) {
    console.log(usage);
    process.exit(1);
}
// nuxeo-js-client 0.24.0
var Nuxeo = require('nuxeo');
var util = require('util');
var connectInfo = {
    baseURL:'http://localhost:8080/nuxeo',
    auth: {
        method: 'basic',
        username: 'Administrator',
        password: 'Administrator'
    }
}
var query = process.argv[2];
console.log('* query: ' + query);
var docSchemas = ['dublincore'];
if (process.argv.length > 3) {
    docSchemas = process.argv[3].split(',');
    //connectInfo.schemas = docSchemas;
}
console.log('* schemas: ' + docSchemas);

var client = new Nuxeo(connectInfo);
if (process.argv.length > 4) {
    enrichers = process.argv[4].split(',');
    client.header('X-NXenrichers.document', enrichers);
}
if (process.argv.length > 4) {
    console.log('* enrichers: ' + enrichers);
}
//query = encodeURI(query);
//console.log('* query: ' + query);

client.request('query?query=' + query).schemas(docSchemas).get().then(function(data) {
    console.log('* executing query using JS lib (request) ...');
    console.log(util.inspect(data, {depth: 6, colors: true}));
}).catch(function(error) {
      throw error;
});

