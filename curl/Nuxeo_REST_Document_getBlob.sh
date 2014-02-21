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

AUTH_PARAMS=""
if [ ! -z "$NX_TOKEN" ]
then
    AUTH_PARAMS="-H NX_TS:$NX_TS -H NX_RD:$NX_RD -H NX_TOKEN:$NX_TOKEN -H NX_USER:$NX_USER"
else
    AUTH_PARAMS="-u $NUXEO_USER:$NUXEO_PASSWORD"
fi

DOCUMENT_PATH=$1
#XPATH="files:files/0/file"
XPATH="file:content"
if [ $# -eq 2 ]
then
    XPATH=$2
fi


HTTP_METHOD="POST" # automation operation
HTTP_METHOD="GET" # REST API

echo "Getting document's blob ..."

# using automation operation
HTTP_METHOD="POST"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH/@op/Blob.Get"
REQ_BODY="{ \"params\": { \"xpath\":\"$XPATH\"}}"

#using REST API
HTTP_METHOD="GET"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/id/$DOC_UID/@blob/$XPATH"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH/@blob/$XPATH"
REQ_BODY=""

echo "$HTTP_METHOD $URL $REQ_BODY"
curl -s -X $HTTP_METHOD \
-w 'HTTP return code: %{http_code}\n' -o blob \
-H "Content-Type:application/json+nxrequest" \
-H "X-NXDocumentProperties:*" \
$AUTH_PARAMS \
-d "$REQ_BODY" \
$URL
#cat $0.out | python -mjson.tool
