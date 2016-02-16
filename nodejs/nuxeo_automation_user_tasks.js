var nuxeo = require('nuxeo');
var util = require('util');
var connectInfo = {
    baseURL:'http://localhost:8080/nuxeo',
    username: 'Administrator',
    password: 'Administrator'
}
var client = new nuxeo.Client(connectInfo);
client.connect(function(error, client) {
    if (error) {
        // cannot connect
        throw error;
    }
    // OK, the returned client is connected
    console.log('* Client is connected: ' + client.connected);
});
client.operation('Workflow.UserTaskPageProvider')
    .params({
        pageSize:0
    })
    .execute(function(error, data) {
    console.log('* Retrieving user tasks ...');
    if (error) {
      throw error;
    }
    console.log(util.inspect(data, {depth: 4, colors: true}));
});

