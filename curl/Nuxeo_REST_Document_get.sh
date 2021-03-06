#!/bin/bash
USAGE="Usage: $0 <docpath> [<comma-separated schemas> [<comma-separated enrichers>] ]"

if [ $# -lt 1 ]
then
    echo $USAGE
    exit 1
fi

if [ -z "$CONF_FILE" ]
then
    CONF_FILE=.setenv
fi
if [ ! -f "$CONF_FILE" ]
then
    echo "No configuration defined. Create a file named '.setenv' or set env. variable CONF_FILE"
    exit 2
fi
. $CONF_FILE
#cat $CONF_FILE

source utils.sh

DOCUMENT_PATH=$(urlEncode "$1")

SCHEMAS_PARAM="*"
if [ $# -gt 1 ]
then
    SCHEMAS_PARAM="$2"
fi
SCHEMAS_REQ_PARAM="-H X-NXproperties:$SCHEMAS_PARAM"

if [ $# -gt 2 ]
then
    ENRICHER_HEADERS="-H 'X-NXenrichers.document:$3'"
    ENRICHER_URL="?enrichers.document=$3"
fi

# -H 'X-NXenrichers.document:allowedDocumentTypes' \
# -H 'X-NXenrichers.document:publishedDocuments' \

echo "Getting document ..."
HTTP_METHOD="GET"
# 7.10
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH$ENRICHER_URL"
echo "$HTTP_METHOD $URL $SCHEMAS_REQ_PARAM $ENRICHER_HEADERS $REQ_BODY"
CURL_CMD="curl -s -X $HTTP_METHOD $(curlAuthParams) \
-H 'Content-Type:application/json' \
${SCHEMAS_REQ_PARAM} \
$URL"

echo $CURL_CMD
DOC_JSON=`eval $CURL_CMD`

firstchar=${DOC_JSON:0:1}
if [ "$firstchar" == "{" ]
then
    echo $DOC_JSON|jq .
    #DOC_UID=`echo $DOC_JSON | jq '.uid'`
    #DOC_UID="${DOC_UID%\"}"
    #DOC_UID="${DOC_UID#\"}"
    #echo "UID:$DOC_UID"
else
    echo $DOC_JSON
fi

