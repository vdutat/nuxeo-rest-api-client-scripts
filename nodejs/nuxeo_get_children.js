var usage = 'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <docpath>'
if (process.argv.length < 3) {
    console.log(usage);
    process.exit(1);
}

var nuxeo = require('nuxeo');
var util = require('util');var connectInfo = {
    baseURL:'http://localhost:8080/nuxeo'
}
var client = new nuxeo.Client(connectInfo).schema('*').header('X-NXenrichers.document', 'children');
client.connect(function(error, client) {
    if (error) {
    // cannot connect
    throw error;
    }

    // OK, the returned client is connected
    console.log('Client is connected: ' + client.connected);
});
var documentPath = process.argv[2];
console.log('document path: ' + documentPath);

console.log('Getting children using REST API ...');
var ws1 = client.document(documentPath);
console.log(util.inspect(ws1, {colors: true}));
ws1.children(function(error, children) {
    if (error) {
      throw error;
    }
    console.log('1.' + ws1.path + ' document has ' + children.entries.length + ' children');
});

/***************************/
console.log('Getting children using automation REST API (path) ...');
client.operation('Document.GetChildren').input('doc:' + ws1.path)
    .execute(function(error, data) {
        if (error) {
          throw error;
        }
        console.log('2.' + ws1.path + ' document has ' + data.entries.length + ' children');
    });
/***************************/
console.log('Getting children using automation REST API (id) ...');
ws1.fetch(function(error, ws) {
    if (error) {
      throw error;
    }
    console.log(util.inspect(ws, {colors: true}));
    console.log('3.' + ws.path + ' document has ' + ws.contextParameters.children.entries.length + ' children');
    
    client.operation('Document.GetChildren').input('doc:' + ws.uid)
    .execute(function(error, data) {
        if (error) {
          throw error;
        }
        console.log('4.' + ws.path + ' document has ' + data.entries.length + ' children');
    });
});
