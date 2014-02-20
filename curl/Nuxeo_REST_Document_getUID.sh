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

AUTH_PARAMS=""
if [ ! -z "$NX_TOKEN" ]
then
    AUTH_PARAMS="-H NX_TS:$NX_TS -H NX_RD:$NX_RD -H NX_TOKEN:$NX_TOKEN -H NX_USER:$NX_USER"
else
    AUTH_PARAMS="-u $NUXEO_USER:$NUXEO_PASSWORD"
fi

DOCUMENT_PATH=$1

echo "Getting document UID ..."
HTTP_METHOD="GET"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH"
REQ_BODY=""
echo "$HTTP_METHOD $URL $REQ_BODY"
CURL_CMD="curl -s -X $HTTP_METHOD $AUTH_PARAMS \
-H 'Content-Type:application/json' \
$URL"
#echo $CURL_CMD
DOC_JSON=`$CURL_CMD`

echo $DOC_JSON > $0.out

#echo $DOC_JSON| python -mjson.tool
DOC_UID=`echo $DOC_JSON | jq '.uid'`
DOC_UID="${DOC_UID%\"}"
DOC_UID="${DOC_UID#\"}"
echo "UID:$DOC_UID"
