var usage = 'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <folder_docpath> <nbr_documents> [<doctype>] [<docname_prefix>]'
if (process.argv.length < 4) {
    console.log(usage);
    process.exit(1);
}

var nuxeo = require('nuxeo');
var util = require('util');
var connectInfo = {
    baseURL:'http://localhost:8080/nuxeo'
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
var docType = 'File';
if (process.argv.length > 4) {
    docType = process.argv[4];
}
var baseDocumentName = 'Doc ';
if (process.argv.length > 5) {
    baseDocumentName = process.argv[5] + ' ';
}
console.log('* parent document path: ' + parentDocumentPath);
console.log('* number of documents to create: ' + nbrDocuments);

var parentDoc = client.document(parentDocumentPath);
for (i = 0; i < nbrDocuments; i++) {
    var documentName = baseDocumentName + i;
    var newDoc = new client.document({
        'entity-type': 'document',
        type: docType,
        name: documentName,
        properties: {'dc:title': documentName, 'dc:description': 'A Simple ' + docType }
    });
    parentDoc.create(newDoc, function(error, doc) {
        if (error) {
          throw error;
        }
        console.log('* Created ' + doc.type + ' - ' + doc.path)
        console.log(util.inspect(doc, {colors: true}));
    });
}

