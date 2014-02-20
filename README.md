nuxeo-rest-api-client-scripts
=============================

Configure `.setenv` file first. 

# Get UID of a document using REST API

Gets Document's ID.  

## Parameters

- document path

```bash

cd curl
CONF_FILE=.setenv Nuxeo_REST_Document_getUID.sh /
```

# Increment version of a document using REST API

Increments document version.  

## Parameters

1. document path  
1. increment: `minor` or `major`  
1. comment (optional)  

```bash

cd curl
CONF_FILE=.setenv Nuxeo_REST_Document_incrementVersion.sh /default-domain/workspaces/doc1 minor "Incrementing minor version"
```

