#!/bin/bash
USAGE="Usage: $0 <string_to_encode>"

if [ $# -lt 1 ]
then
    echo $USAGE
    exit 1
fi

source utils.sh

ENCODED_URL=$(urlEncode "$1")

echo "$ENCODED_URL"

