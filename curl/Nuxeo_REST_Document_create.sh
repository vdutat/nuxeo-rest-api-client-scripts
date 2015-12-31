USAGE="Usage: $0 <folder_docpath> <docname> [<doctype>]"

if [ $# -lt 1 ]
then
    echo $USAGE
    echo
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

DOCUMENT_PARENT_PATH=$(urlEncode "$1")
DOCUMENT_NAME=$2
DOCUMENT_TYPE=File

if [ $# -ge 3 ]
then
    DOCUMENT_TYPE=$3
fi

echo "Creating Document of type '$DOCUMENT_TYPE' in $DOCUMENT_PARENT_PATH ..."
HTTP_METHOD="POST"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PARENT_PATH"
REQ_BODY="{ \"entity-type\": \"document\", \"name\":\"$DOCUMENT_NAME\", \"type\": \"$DOCUMENT_TYPE\",\"properties\": { \"dc:title\": \"$DOCUMENT_NAME\", \"dc:description\": \"Created via a so cool and simple REST API\", \"common:icon\": \"/icons/file.gif\", \"common:icon-expanded\": null, \"common:size\": null}}"
echo "$HTTP_METHOD $URL $REQ_BODY"
curl -X $HTTP_METHOD $(curlAuthParams) \
-H 'Content-Type:application/json' \
-H 'X-NXproperties:dublincore,common,file' \
-o $0.out \
-d "$REQ_BODY" \
$URL

DOC_JSON=`cat $0.out`

firstchar=${DOC_JSON:0:1}
if [ "$firstchar" == "{" ]
then
    echo $DOC_JSON|jq .
else
    echo $DOC_JSON
fi

