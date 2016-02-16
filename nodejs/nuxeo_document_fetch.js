var usage = 'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <docpath> [<comma-separated enrichers>]'
if (process.argv.length < 3) {
    console.log(usage);
    process.exit(1);
}

var nuxeo = require('nuxeo');
var util = require('util');var connectInfo = {
    baseURL:'http://localhost:8080/nuxeo',
    username: 'Administrator',
    password: 'Administrator'
}
var client = new nuxeo.Client(connectInfo).schema('*');
var enrichers = process.argv.slice(3).join(',');
if (enrichers.length > 0) {
    //client.header('X-NXenrichers.document', enrichers);
    client.header('X-NXContext-Category', enrichers);
}
client.connect(function(error, client) {
    if (error) {
        // cannot connect
        throw error;
    }
    // OK, the returned client is connected
    //console.log('Client is connected: ' + client.connected);
});
var documentPath = process.argv[2];
console.log('document path: ' + documentPath);
client.document(documentPath).fetch(function(error, doc) {
    if (error) {
        throw error;
    }
    //console.log('YES %j', doc);
    console.log(util.inspect(doc, {colors: true, depth: 7}));
});


