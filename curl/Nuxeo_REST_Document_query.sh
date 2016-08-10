USAGE="Usage: $0 <docpath> <NXQL query> [<comma-separated schemas>]"

if [ $# -lt 2 ]
then
    echo -e $USAGE
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

DOCUMENT_PATH=$1
PLAIN_QUERY=$2
TMP_FILENAME=`basename $0`.`date "+%s"`.out

SCHEMAS_PARAM="*"
if [ $# -eq 3 ]
then
    SCHEMAS_PARAM="$3"
fi
SCHEMAS_REQ_PARAM="-H X-NXproperties:$SCHEMAS_PARAM"

echo "Querying documents ..."
HTTP_METHOD="GET"

#PLAIN_QUERY="SELECT * FROM Document WHERE ecm:path STARTSWITH '$DOCUMENT_PATH' AND ecm:isCheckedInVersion = 0 AND ecm:currentLifeCycleState <> 'deleted'"
QUERY=$(urlEncode "$PLAIN_QUERY")
URL="http://$NUXEO_SERVER/nuxeo/api/v1/repo/${NUXEO_REPOSITORY:-default}/path$DOCUMENT_PATH/@search?query=$QUERY&pageSize=0&&maxResults=0"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/query/?query=$QUERY&pageSize=0&&maxResults=0"

REQ_BODY=""
REQ_PARAMS=""
echo "$HTTP_METHOD $URL $REQ_BODY $SCHEMAS_REQ_PARAM"

curl -s -X $HTTP_METHOD  $(curlAuthParams) \
-H 'Content-Type:application/json' \
${SCHEMAS_REQ_PARAM} \
-w 'HTTP return code: %{http_code}\n' -o $TMP_FILENAME \
$URL
DOC_JSON=`cat $TMP_FILENAME`
rm -f $TMP_FILENAME
#echo $CURL_CMD

firstchar=${DOC_JSON:0:1}
if [ "$firstchar" == "{" ]
then
    echo $DOC_JSON|jq .
else
    echo $DOC_JSON
fi
