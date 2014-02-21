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
CONF_FILE=.setenv Nuxeo_REST_Document_incrementVersion.sh /default-domain/workspaces/workspace1/doc1 minor "Incrementing minor version"
```

# Download document's blob using REST API

Downloads document's blob. Blob will be saved in a file named `blob` in the current directory.  

## Parameters

1. document path  
1. blob's xpath (optional. Default value: `file:content`)  

```bash

cd curl
CONF_FILE=.setenv Nuxeo_REST_Document_getBlob.sh /default-domain/workspaces/workspace1/doc1
```

```bash

cd curl
CONF_FILE=.setenv Nuxeo_REST_Document_getBlob.sh /default-domain/workspaces/workspace1/doc1 files:files/0/file
```

