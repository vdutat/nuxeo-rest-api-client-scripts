jsonQuery () {
    local filter=$2
    local __local_val=`echo $1 | jq -r $filter 2>/dev/null`
    #__local_val="${__local_val%\"}"
    #__local_val="${__local_val#\"}"
    echo $__local_val
}

curlAuthParams() {
    local __local_auth_params=""
    if [ ! -z "$NX_TOKEN" -a ! -z "$NX_USER" ]
    then
        __local_auth_params="-H NX_TS:$NX_TS -H NX_RD:$NX_RD -H NX_TOKEN:$NX_TOKEN -H NX_USER:$NX_USER"
    elif [ ! -z "$NX_TOKEN" ]
    then
        __local_auth_params="-H X-Authentication-Token:$NX_TOKEN"
    else
        __local_auth_params="-u $NUXEO_USER:$NUXEO_PASSWORD"
    fi
    echo $__local_auth_params
}

urlEncode() {
    local __url_encoded=`python -c "import sys, urllib as ul; print ul.quote(sys.argv[1])" "$1"`
    echo $__url_encoded
}

formatJsonDate() {
    local __formatted_created=""
    __formatted_created=`date --date="$1" "+%FT%T.00Z"`
    echo $__formatted_created
}

