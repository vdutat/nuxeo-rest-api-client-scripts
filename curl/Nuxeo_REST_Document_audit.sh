USAGE="Usage: $0 <docpath> [<eventIDs_comma_separated>|- [<eventCategories_comma_separated>|- [<principals_comma_separated>|- [<startdateYYYY-MM-DD>|- [<enddateYYYY-MM-DD>|-] ] ] ] ]\n Ex:\n\t$0 / - - - 2014-01-30 2014-02-01"

if [ $# -lt 1 ]
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

DOCUMENT_PATH=$(urlEncode "$1")

#request parameters:
#eventId: list of event IDs
#category: list of event categories
#principalName: list of principal names
#startEventDate: yyyy-MM-dd
#endEventDate: yyyy-MM-dd

REQ_PARAMS=""
if [ $# -ge 2 ]
then
    EVENT_IDS=$2
    if [ "$EVENT_IDS" != "-" ]
    then
        if [ -z "$REQ_PARAMS" ]
        then
            REQ_PARAMS="?"
        else
            REQ_PARAMS+="&"
        fi
        REQ_PARAMS+="eventId="
        CONV_STR=(${EVENT_IDS//,/&eventId=})
        REQ_PARAMS+=$CONV_STR
    fi
fi
if [ $# -ge 3 ]
then
    EVENT_CATEGORIES=$3
    if [ "$EVENT_CATEGORIES" != "-" ]
    then
        if [ -z "$REQ_PARAMS" ]
        then
            REQ_PARAMS="?"
        else
            REQ_PARAMS+="&"
        fi
        REQ_PARAMS+="category="
        CONV_STR=(${EVENT_CATEGORIES//,/&category=})
        REQ_PARAMS+=$CONV_STR
    fi
fi
if [ $# -ge 4 ]
then
    PRINCIPALS=$4
    if [ "$PRINCIPALS" != "-" ]
    then
        if [ -z "$REQ_PARAMS" ]
        then
            REQ_PARAMS="?"
        else
            REQ_PARAMS+="&"
        fi
        REQ_PARAMS+="principalName="
        CONV_STR=(${PRINCIPALS//,/&principalName=})
        REQ_PARAMS+=$CONV_STR
    fi
fi
if [ $# -ge 5 ]
then
    START_DATE=$5
    if [ -z "$REQ_PARAMS" ]
    then
        REQ_PARAMS="?"
    else
        REQ_PARAMS+="&"
    fi
    REQ_PARAMS+="startEventDate=$START_DATE"
fi
if [ $# -ge 6 ]
then
    END_DATE=$6
    if [ -z "$REQ_PARAMS" ]
    then
        REQ_PARAMS="?"
    else
        REQ_PARAMS+="&"
    fi
    REQ_PARAMS+="endEventDate=$END_DATE"
fi

echo "Getting document history ..."
HTTP_METHOD="GET"
URL="http://$NUXEO_SERVER/nuxeo/api/v1/path$DOCUMENT_PATH/@audit$REQ_PARAMS"
REQ_BODY=""
echo "$HTTP_METHOD $URL $REQ_BODY"
curl -s -X $HTTP_METHOD $(curlAuthParams) \
-H 'Content-Type:application/json' \
-o $0.out \
-w 'HTTP return code: %{http_code}\n' \
$URL

DOC_JSON=`cat $0.out`

firstchar=${DOC_JSON:0:1}
if [ "$firstchar" == "{" ]
then
    echo $DOC_JSON|jq .
else
    echo $DOC_JSON
fi

