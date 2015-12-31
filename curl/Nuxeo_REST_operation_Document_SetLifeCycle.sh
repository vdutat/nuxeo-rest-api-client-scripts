USAGE="Usage: $0 <docpath> <transition>"

if [ $# -lt 2 ]
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
    exit
fi
. $CONF_FILE
#cat $CONF_FILE

source utils.sh

DOCUMENT_PATH=$(urlEncode "$1")
TRANSITION_NAME=$2

rm -f $0.out

echo "Document following transition $TRANSITION_NAME ..."
HTTP_METHOD="POST"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH/@op/Document.SetLifeCycle"
REQ_BODY="{ \"params\": { \"value\": \"$TRANSITION_NAME\"}}"
echo "$HTTP_METHOD $URL $REQ_BODY"
curl -s -X $HTTP_METHOD $(curlAuthParams) \
-w 'HTTP return code: %{http_code}\n' -o $0.out \
-H "Content-Type: application/json+nxrequest" \
-d "$REQ_BODY" \
$URL

DOC_JSON=`cat $0.out 2> /dev/null`

firstchar=${DOC_JSON:0:1}
if [ "$firstchar" == "{" ]
then
    echo $DOC_JSON|jq .
else
    echo $DOC_JSON
fi

