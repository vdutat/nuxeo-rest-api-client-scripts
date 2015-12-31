USAGE="Usage: $0 <docpath>"

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

echo "Getting document UID ..."
HTTP_METHOD="GET"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH"
REQ_BODY=""
echo "$HTTP_METHOD $URL $REQ_BODY"
curl -s -X $HTTP_METHOD $(curlAuthParams) \
-H 'Content-Type:application/json' \
-o $0.out \
$URL

DOC_JSON=`cat $0.out`

firstchar=${DOC_JSON:0:1}
if [ "$firstchar" == "{" ]
then
    echo $DOC_JSON|jq .
    DOC_UID=`echo $DOC_JSON | jq '.uid'`
    DOC_UID="${DOC_UID%\"}"
    DOC_UID="${DOC_UID#\"}"
    echo "UID:$DOC_UID"
else
    echo $DOC_JSON
fi

