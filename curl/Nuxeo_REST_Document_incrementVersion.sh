USAGE="Usage: $0 <docpath> minor|major [<comment>]"

if [ $# -lt 2 ]
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
VERSION_INCR=$2
#VERSION_INCR=$(echo "$VERSION_INCR" | tr '[:upper:]' '[:lower:]') 
VERSION_INCR=${VERSION_INCR,}
if [ "$VERSION_INCR" != "minor" -a "$VERSION_INCR" != "major" ]
then
    VERSION_INCR="minor"
fi
VERSION_COMMENT=""
if [ $# -eq 3 ]
then
    VERSION_COMMENT=$3
fi

echo "Getting document ..."
HTTP_METHOD="GET"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH"
REQ_BODY=""
echo "$HTTP_METHOD $URL $REQ_BODY"
curl -s -X $HTTP_METHOD \
-w 'HTTP return code: %{http_code}\n' -o $0.out \
$AUTH_PARAMS \
-H "Content-Type:application/json" \
$URL

DOC_JSON=`cat $0.out`
echo $DOC_JSON| python -mjson.tool
DOC_ISCHECKEDOUT=`echo $DOC_JSON | jq '.isCheckedOut'`
DOC_ISCHECKEDOUT="${DOC_ISCHECKEDOUT%\"}"
DOC_ISCHECKEDOUT="${DOC_ISCHECKEDOUT#\"}"

#echo "* Document.isCheckedOut= $DOC_ISCHECKEDOUT"
if [ "$DOC_ISCHECKEDOUT" = "false" ]
then
    echo "Checking out document ..."
    HTTP_METHOD="POST"
    URL="http://$NUXEO_SERVER/nuxeo/api/v1/path/$DOCUMENT_PATH/@op/Document.CheckOut"
    REQ_BODY="{ \"params\": {}}"
    echo "$HTTP_METHOD $URL $REQ_BODY"
    curl -s -X $HTTP_METHOD \
    -w 'HTTP return code: %{http_code}\n' -o $0.out \
    -H "Content-Type:application/json+nxrequest" \
    $AUTH_PARAMS \
    -d "$REQ_BODY" \
    $URL
    cat $0.out | python -mjson.tool
fi

echo "Incrementing $VERSION_INCR version of document with comment $VERSION_COMMENT ..."
HTTP_METHOD="POST"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path/$DOCUMENT_PATH/@op/Document.CheckIn"
REQ_BODY="{ \"params\": { \"version\":\"$VERSION_INCR\", \"comment\":\"$VERSION_COMMENT\"}}"
echo "$HTTP_METHOD $URL $REQ_BODY"
curl -s -X $HTTP_METHOD \
-w 'HTTP return code: %{http_code}\n' -o $0.out \
-H "Content-Type:application/json+nxrequest" \
-H "X-NXDocumentProperties:*" \
$AUTH_PARAMS \
-d "$REQ_BODY" \
$URL
cat $0.out | python -mjson.tool
