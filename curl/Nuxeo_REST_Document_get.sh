#!/bin/bash
USAGE="Usage: $0 <docpath> [<comma-separated enrichers>]"

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

if [ $# -gt 1 ]
then
    # 6.0
    #ENRICHERS="-H 'X-NXContext-Category:$2'"
    # 7.2
    ENRICHERS="-H 'X-NXenrichers.document:$2'"
fi

# 6.0
# -H 'X-NXContext-Category:allowedDocumentTypes' \
# 7.2
# -H 'X-NXenrichers.document:allowedDocumentTypes' \
# -H 'X-NXenrichers.document:publishedDocuments' \

echo "Getting document ..."
HTTP_METHOD="GET"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH"
echo "$HTTP_METHOD $URL $ENRICHERS $REQ_BODY"
CURL_CMD="curl -s -X $HTTP_METHOD $ENRICHERS $(curlAuthParams) \
-H 'Content-Type:application/json' \
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
