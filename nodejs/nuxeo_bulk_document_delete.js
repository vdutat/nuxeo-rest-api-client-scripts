var usage = 'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <folder_docpath> <nbr_documents> <docname_prefix>';
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
var client = new nuxeo.Client(connectInfo).schema('*');
client.connect(function(error, client) {
    if (error) {
    // cannot connect
        throw error;
    }
    // OK, the returned client is connected
    console.log('* Client is connected: ' + client.connected);
});
var parentDocumentPath = process.argv[2];
var nbrDocuments = process.argv[3];
var baseDocumentName = 'Doc ';
if (process.argv.length > 4) {
    baseDocumentName = process.argv[4] + ' ';
}
var baseDocumentPath = parentDocumentPath + '/' + baseDocumentName;
console.log('* base document path: ' + baseDocumentPath);
console.log('* number of documents to create: ' + nbrDocuments);

for (i = 0; i < nbrDocuments; i++) {
    var documentPath = baseDocumentPath + i;
    var doc = new client.document(documentPath);
    doc.delete(function(error) {
        console.log('* Deleting ' + doc.type + ' - ' + doc.path);
        if (error) {
          throw error;
        }
    });
}
