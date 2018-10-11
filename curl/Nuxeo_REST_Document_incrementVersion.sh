USAGE="Usage: $0 <docpath> MINOR|MAJOR"

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
#cat $CONF_FILE

source utils.sh

DOCUMENT_PATH=$(urlEncode "$1")

VERSION_INCR=${2^^}
if [ "$VERSION_INCR" != "MINOR" -a "$VERSION_INCR" != "MAJOR" ]
then
    VERSION_INCR="MINOR"
fi

rm -f $0.out
echo "Incrementing $VERSION_INCR version of document $DOCUMENT_PATH ..."
HTTP_METHOD="PUT"
HTTP_HEADERS="-H 'X-Versioning-Option:$VERSION_INCR'"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/repo/${NUXEO_REPOSITORY:-default}/path$DOCUMENT_PATH"
REQ_BODY="{ \"entity-type\": \"document\", \"properties\": {} }"
echo "$HTTP_METHOD $URL $HTTP_HEADERS"
curl -s -X $HTTP_METHOD $HTTP_HEADERS $(curlAuthParams) \
-w 'HTTP return code: %{http_code}\n' -o $0.out \
-H "Content-Type:application/json" \
-H "X-NXproperties:*" \
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

