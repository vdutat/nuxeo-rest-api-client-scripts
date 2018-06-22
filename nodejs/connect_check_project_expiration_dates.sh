if [ $# -lt 1 ]
then
    echo "! Missing parameter: Studio project name"
    exit 1
fi
STUDIO_PROJECT_NAME=$1

PROJECT_UUID=`node nuxeo_search.js "SELECT * FROM Document WHERE ecm:primaryType='ConnectProject' AND connectproject:symbolicName = '${STUDIO_PROJECT_NAME}'" -c connect_config.json -s "*" -S | jq -r .entries[].uid`
if [ -z "$PROJECT_UUID" ]
then
    echo "! Unknown Studio project '$STUDIO_PROJECT_NAME'"
    exit 2
fi
echo "* Project UUID: ${PROJECT_UUID}"

node nuxeo_search.js "SELECT * FROM Document WHERE ecm:primaryType = 'ConnectService' AND connectservice:projects = '${PROJECT_UUID}'" -c connect_config.json -s "*" -S | jq -r '.entries[] | "* Service " + .title + " (" + .uid + "): " + .properties["connectservice:startDate"] + " -> " + .properties["connectservice:endDate"]'
