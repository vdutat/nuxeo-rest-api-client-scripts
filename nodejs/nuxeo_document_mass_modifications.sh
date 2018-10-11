USAGE="Usage: $0 <document_path> <number_of_modifications>\n\t$0 <document_path> <start_index> <end_index>"
if [ $# -lt 2 ]
then
    echo "Missing paramters."
    echo -e $USAGE
    exit
fi

DOC_PATH=$1
START_IDX=0
END_IDX=$2

if [ $# -gt 2 ]
then
    START_IDX=$2
    END_IDX=$3
fi
for ((i=$START_IDX; i<$END_IDX; i++))
do
    echo "$DOC_PATH updated ($i)"
    node nuxeo_document_update.js $DOC_PATH -p "\"dc:description\":\"$i\"" -S
done
