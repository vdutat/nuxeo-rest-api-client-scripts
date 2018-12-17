# Requirements:
# - `jq` command
# - install addon `nuxeo-csv`
# - configure `nuxeo.csv.blobs.folder` in `nuxeo.conf` with the full path of directory that will contain the generated images
#
# This script
# - genrates a number of PNG files
# - generates the related `CSV import` file
# - uploads the `CSV import` file
# - triggers the `CSV import`

USAGE="Usage: $0 <end_index>\n  $0 <start_index> <end_index> [<document_type [<folderish_import_document_path>] ]\n  Ex: $0 0 9 File /default-domain/workspaces/csv-imports"
if [ $# -lt 1 ]
then
    echo "Missing paramters."
    echo -e $USAGE
    exit
fi
START_IDX=0
END_IDX=$1
if [ $# -ge 2 ]
then
    START_IDX=$1
    END_IDX=`expr $2+1`
fi
DOCTYPE=File
if [ $# -gt 2 ]
then
    DOCTYPE=$3
fi
DOCUMENT_PARENT_PATH=/default-domain/workspaces/csv-imports
if [ $# -gt 3 ]
then
    DOCUMENT_PARENT_PATH=$4
fi

val=$(( $END_IDX - 1 ))
digit_nbr=`echo -n "${val}" | wc -c`
format_str="%0${digit_nbr}d"
CSV_FN=import.csv

echo '"name","type","dc:title","file:content"' > $CSV_FN
for ((i=$START_IDX; i<$END_IDX; i++))
do
    printf -v idx "$format_str" $i
    filename=${idx}.png
    echo "\"doc-${idx}\",\"${DOCTYPE}\",\"${DOCTYPE} $idx\",\"${filename}\"" >> $CSV_FN
    convert -size 150x label:${idx} $filename
    echo "text: '${idx}' - file '${filename}' generated."
done


NUXEO_PROTOCOL=http # UPDATE THIS
NUXEO_PORT=":8080" # UPDATE THIS
NUXEO_HOST=localhost # UPDATE THIS
NUXEO_CRED="Administrator:Administrator" # UPDATE THIS

NUXEO_SERVER=$NUXEO_HOST$NUXEO_PORT
BASE_URL="${NUXEO_PROTOCOL:-http}://$NUXEO_SERVER${APP_URL:-/nuxeo}"

# Init batch

BATCHID=`curl -s -X POST -u $NUXEO_CRED ${BASE_URL}/api/v1/upload | jq -r .batchId`
echo "* Batch ID: $BATCHID"

[[ -z "$BATCHID" ]] && { echo "! Init batch failed"; exit 1; }
NEW_DOCUMENT_NAME=$BATCHID

# Upload CSV file

curl -s -X POST -u $NUXEO_CRED \
-H "X-File-Name:$CSV_FN" \
-H "X-File-Type:text/plain" \
-T $CSV_FN \
${BASE_URL}/api/v1/upload/$BATCHID/0 | jq .
#echo "* rc: $?"

# Wait for upload completion

declare -i nbr
nbr=0
while [ $nbr -eq 0 ]
do
    echo "* Waiting for upload completion ($nbr)"
    sleep 1
    nbr=`curl -s -u $NUXEO_CRED ${BASE_URL}/api/v1/upload/$BATCHID/info | jq '.fileEntries| length'`
done
echo "* Files uploaded"

# Trigger CSV import of uploaded CSV file

REQ_BODY="{\"params\": {\"path\":\"$DOCUMENT_PARENT_PATH\"}, \"context\": {}}"
CSV_IMPORT_ID=`curl -s -X POST -u $NUXEO_CRED \
-H 'Content-Type:application/json' \
-d "$REQ_BODY" \
"${BASE_URL}/api/v1/upload/$BATCHID/0/execute/CSV.Import" | jq -r .value`
echo "* CSV import ID: $CSV_IMPORT_ID"

# Wait for CSV import completion

IMPORT_COMPLETED="false"
REQ_BODY="{\"input\":\"$CSV_IMPORT_ID\"}"
while [ "$IMPORT_COMPLETED" == "false" ]
do
    IMPORT_COMPLETED=`curl -s -X POST -u $NUXEO_CRED \
    -H 'Content-Type:application/json' \
    -d "$REQ_BODY" \
    "${BASE_URL}/site/automation/CSV.ImportStatus" | jq -r .value.complete`
    sleep 1
    echo "* import completed: $IMPORT_COMPLETED"
done

# Retrieve CSV import log

echo "* CSV import log:"
curl -s -X POST -u $NUXEO_CRED \
-H 'Content-Type:application/json' \
-d "$REQ_BODY" \
"${BASE_URL}/site/automation/CSV.ImportLog" | jq .

# Retrieve CSV import results

echo "* CSV import result:"
curl -s -X POST -u $NUXEO_CRED \
-H 'Content-Type:application/json' \
-d "$REQ_BODY" \
"${BASE_URL}/site/automation/CSV.ImportResult" | jq .

