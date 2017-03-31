USAGE="Usage: $0 <secret> <username> [<random_string>]"

if [ $# -lt 2 ] 
then
    echo $USAGE
    exit
fi

NX_TS=$(($(date +'%s * 1000')))
NX_SECRET=$1
NX_USERNAME=$2
if [ $# -eq 3 ]
then
    NX_RD=$3
else
    NX_RD=$RANDOM
fi

# test values, NX_TOKEN: 8y4yXfms/iKge/OtG6d2zg==
#NX_TS="1391399566031000"
#NX_RD="qwertyuiop"
#NX_SECRET="secret"
#NX_USERNAME="bob"

CLEAR_TOKEN="$NX_TS:$NX_RD:$NX_SECRET:$NX_USERNAME"

#MD5_TOKEN=`echo -n "$CLEAR_TOKEN"| openssl dgst -md5 -binary`
#echo "$MD5_TOKEN"

NX_TOKEN=`echo -n "$CLEAR_TOKEN"| openssl dgst -md5 -binary | openssl enc -base64`
echo "NX_TS=$NX_TS"
echo "NX_RD=$NX_RD"
echo "NX_USER=$NX_USERNAME"
echo "NX_TOKEN=$NX_TOKEN"

