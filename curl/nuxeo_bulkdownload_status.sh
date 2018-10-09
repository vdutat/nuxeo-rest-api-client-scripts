USAGE="Usage: $0 <download_key>\n"
if [ $# -lt 1 ]
then
    echo -e $USAGE
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

DOWNLOAD_KEY=$1

HTTP_METHOD="GET"
URL="$NUXEO_PROTOCOL://$NUXEO_SERVER/nuxeo/nxblobstatus/$DOWNLOAD_KEY"

#echo "$HTTP_METHOD $URL"

curl -s -X $HTTP_METHOD $(curlAuthParams) \
$URL


