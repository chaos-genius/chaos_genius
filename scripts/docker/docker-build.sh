#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
suffix="/scripts/docker"
BASE_DIR=${SCRIPT_DIR%"$suffix"}
declare -a EXP_ANS=("y" "n" "")
FRONTEND_REPO="chaosgenius/chaosgenius-webapp"
BACKEND_REPO="chaosgenius/chaosgenius-server"
#echo "The Script in Running in $SCRIPT_DIR"
#echo "Base Dir for CG is $BASE_DIR"


get_tags_list () {
    tags=$(wget -q https://registry.hub.docker.com/v1/repositories/$1/tags -O -  | sed -e 's/[][]//g' -e 's/"//g' -e 's/ //g' | tr '}' '\n'  | awk -F: '{print $3}')
    #tags_list=(${tags// / })
    echo $tags
}


read -p "Build the Frontend Image ? (y/n): " temp_ans1
ans1=$(echo $temp_ans1 | xargs)
while [[ ! " ${EXP_ANS[*]} " =~ " ${ans1} " ]];
do
    echo "unexpected Input - $ans1, Enter 'y' or press Enter for yes, Enter 'n' for no"
    read -p "Build the Frontend Image ? (y/n): " temp_ans1
    ans1=$(echo $temp_ans1 | xargs)
done

if [ "$ans1" = 'y' ] || [ "$ans1" = '' ];
then
    echo ""
    echo "The new Image will be named - $FRONTEND_REPO"
    
    echo "Following are the tags present in the Remote Frontend Repository ( $FRONTEND_REPO ):"
    ftags=$(get_tags_list $FRONTEND_REPO)
    ftags_list=(${ftags// / })

    echo
    for i in "${ftags_list[@]}"
    do
        echo $i
    done

    echo
    echo "Entering one of the tags from the above list will 'Overwite' the corresponding tag in the Remote Repository, Otherwise a new Tag will be created"
    read -p "Enter the Image TAG which will be assigned to the new Frontend Image (Default Tag: latest): " temp_FTAG
    FTAG=$(echo $temp_FTAG | xargs)
    
    if [ "$FTAG" = '' ];
    then
        FTAG='latest'
    fi

    flag="1"
    while [ "$flag" = "1" ];
    do
        if [[ " ${ftags_list[*]} " =~ " ${FTAG} " ]]; then

            read -p "Tag $FTAG already exists in repository, overwrite ?(y/n): " temp_choice1
            choice1=$(echo $temp_choice1 | xargs)
            while [[ ! " ${EXP_ANS[*]} " =~ " ${choice1} " ]];
            do
                echo "unexpected Input - $choice1, Enter 'y' or press Enter for yes, Enter 'n' for no"
                read -p "Tag $FTAG already exists in repository, overwrite ?(y/n): " temp_choice1
                choice1=$(echo $temp_choice1 | xargs)
            done

            if [ "$choice1" = 'y' ] || [ "$choice1" = '' ];
            then
                flag="0"
            else
                read -p "Enter new Tag : " FTAG
            fi
        else
            flag="0"
        fi
    done
fi


echo ""
read -p "Build the Backend(Server) Image ? (y/n): " temp_ans2
ans2=$(echo $temp_ans2 | xargs)
while [[ ! " ${EXP_ANS[*]} " =~ " ${ans2} " ]];
do
    echo "unexpected Input - $ans2, Enter 'y' or press Enter for yes, Enter 'n' for no"
    read -p "Build the Backend(Server) Image ? (y/n): " temp_ans2
    ans2=$(echo $temp_ans2 | xargs)
done

if [ "$ans2" = 'y' ] || [ "$ans2" = '' ];
then
    echo ""
    # read -p "Enter the Image NAME which will be used to tag the Backend Image (Default Name: chaosgenius-server): " temp_BIMAGE_NAME
    # BIMAGE_NAME=$(echo $temp_BIMAGE_NAME | xargs)
    echo "The new Image will be named - $BACKEND_REPO"

    echo "Following are the tags present in the Backend Repository ( $BACKEND_REPO ):"
    btags=$(get_tags_list $BACKEND_REPO)
    btags_list=(${btags// / })
    
    echo
    for j in "${btags_list[@]}"
    do
        echo $j
    done
    
    echo
    echo "Entering one of the tags from the above list will 'Overwite' the corresponding tag in the Remote Repository, Otherwise a new Tag will be created"
    read -p "Enter the Image TAG which will be assigned to the new Backend Image (Default Tag: latest): " temp_BTAG
    BTAG=$(echo $temp_BTAG | xargs)


    if [ "$BTAG" = '' ];
    then
        BTAG='latest'
    fi

    flag="1"
    while [ "$flag" = "1" ];
    do
        if [[ " ${btags_list[*]} " =~ " ${BTAG} " ]]; then
            
            read -p "Tag $BTAG already exists in repository, overwrite ?(y/n): " temp_choice2
            choice2=$(echo $temp_choice2 | xargs)
            while [[ ! " ${EXP_ANS[*]} " =~ " ${choice2} " ]];
            do
                echo "unexpected Input - $choice2, Enter 'y' or press Enter for yes, Enter 'n' for no"
                read -p "enter y n or leave empty for yes: " temp_choice2
                choice2=$(echo $temp_choice2 | xargs)
            done

            if [ "$choice2" = 'y' ] || [ "$choice2" = '' ];
            then
                flag="0"
            else
                read -p "Enter new Tag : " BTAG
            fi
        else
            flag="0"
        fi

    done

fi

echo ""

if [ "$ans1" = 'y' ] || [ "$ans1" = '' ];
then
    echo "Building Frontend Image ......"
    echo
    docker build -f "$BASE_DIR/frontend/Dockerfile.prod" -t $FRONTEND_REPO:$FTAG "$BASE_DIR/frontend/"
    echo
fi

if [ "$ans2" = 'y' ] || [ "$ans2" = '' ];
then
    echo "Building Backend Image ......."
    echo 
    docker build -t $BACKEND_REPO:$BTAG $BASE_DIR
    echo
fi

#echo "Images Created :"
#docker images | grep '$BIMAGE_NAME\|$FIMAGE_NAME'
if [ "$FTAG" != "" ] || [ "$BTAG" != "" ];
then
    read -p "Continue to pushing images to Dockerhub ?(y/n): " temp_ans3
    ans3=$(echo $temp_ans3 | xargs)
    while [[ ! " ${EXP_ANS[*]} " =~ " ${ans3} " ]];
    do
        echo "unexpected Input - $ans3, Enter 'y' or press Enter for yes, Enter 'n' for no"
        read -p "Continue to pushing images to Dockerhub ?(y/n): " temp_ans3
        ans3=$(echo $temp_ans3 | xargs)
    done
    if [ "$ans3" = 'y' ] || [ "$ans3" = '' ];
    then
        /bin/bash $BASE_DIR/scripts/docker/docker-push.sh
    fi
fi
echo "Exiting...."
