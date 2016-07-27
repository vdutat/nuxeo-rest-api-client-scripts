#!/bin/bash
USAGE="Usage: $0 [<index_name>] [<json_payload_filepath>]\nEx.: $0 nuxeo\n     $0 audit Nuxeo_REST_es.audit_docUUID.json"

#if [ $# -lt 1 ]
#then
#    echo $USAGE
#    exit 1
#fi

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

source utils.sh

ES_INDEX=/nuxeo
if [ $# -gt 0 ]
then
    ES_INDEX=/$1
fi

JSON_FILENAME="./Nuxeo_REST_es.json"
if [ $# -gt 1 ]
then
    JSON_FILENAME=$2
fi
if [ -f $JSON_FILENAME ]
then
    REQ_BODY=`cat $JSON_FILENAME`
else
    REQ_BODY="{ \"query\": { \"match_all\":{}}}"
fi

RESULTS_NBR=99999

echo "Getting documents ..."
HTTP_METHOD="POST"

URL="$NUXEO_PROTOCOL://$NUXEO_SERVER/nuxeo/site/es$ES_INDEX/_search"
echo "$HTTP_METHOD $URL $REQ_BODY"
CURL_CMD="curl -s -X $HTTP_METHOD $(curlAuthParams) \
-H 'Content-Type: application/json' \
'$URL' \
-d '$REQ_BODY'"

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

