USAGE="Usage: $0 <docpath> [<blob_xpath>]"

if [ $# -lt 1 ]
then
    echo $USAGE
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
cat $CONF_FILE

source utils.sh

DOCUMENT_PATH=$(urlEncode "$1")
#XPATH="files:files/0/file"
XPATH="file:content"
if [ $# -eq 2 ]
then
    XPATH=$2
fi

HTTP_METHOD="GET" # REST API

echo "Getting document's blob ..."

#using REST API
HTTP_METHOD="GET"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/id/$DOC_UID/@blob/$XPATH"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH/@blob/$XPATH"
REQ_BODY=""

echo "$HTTP_METHOD $URL $REQ_BODY"
curl -s -X $HTTP_METHOD $(curlAuthParams) \
-w 'HTTP return code: %{http_code}\n' -o blob \
-H "Content-Type:application/json+nxrequest" \
-H "X-NXDocumentProperties:*" \
-d "$REQ_BODY" \
$URL
#cat $0.out | python -mjson.tool
