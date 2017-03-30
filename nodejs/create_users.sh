function addProfileImage {
    USERNAME=$1
    FILENAME=$2
# TODO 'UserProfile' document is not automatically created at user's creation, see https://jira.nuxeo.com/browse/NXP-21235
    USER_WS_ID=`node nuxeo_document_fetch.js /default-domain/UserWorkspaces/$USERNAME -S | jq -r .uid 2> /dev/null`
    if [ "$USER_WS_ID" == "" ]
    then
        echo "! no user workspace found for $USERNAME"
    else
        PROFILE_PATH=`node nuxeo_query.js "SELECT * FROM Document where ecm:mixinType = 'UserProfile' AND ecm:parentId ='$USER_WS_ID' " -S | jq -r ".entries[] | .path"`
        if [ "$PROFILE_PATH" == "" ]
        then
            echo "! no user profile found for $USERNAME"
        else
            node nuxeo_upload_blob.js "$PROFILE_PATH" "$FILENAME" -p userprofile:avatar -s userprofile -s dublincore
        fi
    fi
}

USERNAME=vdu1
node nuxeo_user_create.js $USERNAME $USERNAME -f Han -l Solo -C Resistance -E $USERNAME@resistance.com -v
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - Han Solo - Profile.png"

USERNAME=vdu2
node nuxeo_user_create.js $USERNAME $USERNAME -f Luke -l Skywalker -C Resistance -E $USERNAME@resistance.com -v
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - Luke Skywalker - Profile.jpg"

USERNAME=vdu3
node nuxeo_user_create.js $USERNAME $USERNAME -f Rey -l null -C Resistance -E $USERNAME@resistance.com -v
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - Rey - Profile.jpg"

USERNAME=vdu4
node nuxeo_user_create.js $USERNAME $USERNAME -f Finn -l null -C Resistance -E $USERNAME@resistance.com -v
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - Finn - Profile.jpg"

USERNAME=vdu5
node nuxeo_user_create.js $USERNAME $USERNAME -f General -l Hux -C "First Order" -E $USERNAME@firstorder.com -v
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - General Hux - Profile.png"

USERNAME=vdu6
node nuxeo_user_create.js $USERNAME $USERNAME -f Captain -l Phasma -C "First Order" -E $USERNAME@firstorder.com -v
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - Captain Phasma - Profile.jpg"

USERNAME=vdu7
node nuxeo_user_create.js $USERNAME $USERNAME -f Chew -l Bacca -C Resistance -E $USERNAME@resistance.com -v
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - Chewbacca - Profile.jpg"

USERNAME=vdu8
node nuxeo_user_create.js $USERNAME $USERNAME -f Leia -l Organa -C Resistance -E $USERNAME@resistance.com
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - Leia Organa - Profile.jpg"

USERNAME=vdu9
node nuxeo_user_create.js $USERNAME $USERNAME -f Obiwan -l Kenobi -C Resistance -E $USERNAME@resistance.com
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - Obiwan Kenobi - Profile.png"

USERNAME=vdu10
node nuxeo_user_create.js $USERNAME $USERNAME -f Yoda -l null -C Resistance -E $USERNAME@resistance.com -v
addProfileImage $USERNAME "/home/vdutat/Pictures/Star Wars - Yoda - Profile.png"

