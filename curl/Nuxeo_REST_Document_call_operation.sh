USAGE="Usage: $0 <docpath> <operation> [<operation output type:blob|json>]\nEx: Nuxeo_REST_Document_call_operation.sh / UserManager.ExportGroups blob"

if [ $# -lt 2 ]
then
    echo -e $USAGE
    exit
fi

if [ -z "$CONF_FILE" ]
then
    CONF_FILE=.setenv
fi
if [ ! -f "$CONF_FILE" ]
then
    echo "No configuration defined. Create a file named '.setenv' or set env. variable CONF_FILE"
    exit
fi
. $CONF_FILE
#cat $CONF_FILE

source utils.sh

DOCUMENT_PATH=$(urlEncode "$1")
OP_NAME=$2

echo "Calling automation $OP_NAME on document ..."

#using REST API
HTTP_METHOD="POST"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/repo/default/path$DOCUMENT_PATH/@op/$OP_NAME"
REQ_BODY="{ \"params\": {}}"

echo "$HTTP_METHOD $URL $REQ_BODY"
curl -s -X $HTTP_METHOD $(curlAuthParams) \
-w 'HTTP return code: %{http_code}\n' -o $0.out \
-H "Content-Type:application/json+nxrequest" \
-H "X-NXDocumentProperties:*" \
-d "$REQ_BODY" \
$URL

if [ $# -eq 3 ]
then
    OP_OUTPUT_TYPE=$3
fi
if [ "$OP_OUTPUT_TYPE" = "blob" ]
then
    echo "Blob output saved to file $0.out"
else
    DOC_JSON=`cat $0.out 2> /dev/null`

    firstchar=${DOC_JSON:0:1}
    if [ "$firstchar" == "{" ]
    then
        echo $DOC_JSON|jq .
    else
        echo $DOC_JSON
    fi
fi 
