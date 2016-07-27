USAGE="Usage: $0 <parentdocpath> <docname>"

if [ $# -lt 2 ]
then
    echo $USAGE
    exit
fi

export CMIS_ROOT_URL=http://localhost:8080/nuxeo/json/cmis/default/root
#export CMIS_ROOT_URL=https://nightly.nuxeo.com/nuxeo/json/cmis/default/root
export AUTH_PARM="-u Administrator:Administrator"
export PARENTDOC_PATH=$1
DOCNAME=$2

getObjectIdByPath() {
    local OBJECTPATH="$1"
    RESPONSE_FILEPATH=$(mktemp -u)
    HTTP_CODE=$(curl -s -o "${RESPONSE_FILEPATH}" -w "%{http_code}" ${AUTH_PARM} \
        "${CMIS_ROOT_URL}/${OBJECTPATH}?cmisselector=properties")
    if [ "${HTTP_CODE}" -lt 200 ] || [ "${HTTP_CODE}" -gt 299 ]; then
        echo "getObjectByPath error: ${HTTP_CODE}, dumpFile: ${RESPONSE_FILEPATH}."
        exit 11
    fi
    local OBJECTID=$(cat ${RESPONSE_FILEPATH} | python -c \
        'import json,sys;obj=json.load(sys.stdin);print obj["cmis:objectId"]["value"]')
    rm -f ${RESPONSE_FILEPATH}
    echo ${OBJECTID}
}

curl -u Administrator:Administrator -F "cmisaction=createDocument" -F "propertyId[0]=cmis:objectTypeId" -F "propertyValue[0]=File" -F "propertyId[1]=cmis:name" -F "propertyValue[1]=${DOCNAME}" -F "versioningState=major" "${CMIS_ROOT_URL}?objectId=$(getObjectIdByPath "${PARENTDOC_PATH}")"
