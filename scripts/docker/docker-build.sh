#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
suffix="/scripts/docker"
BASE_DIR=${SCRIPT_DIR%"$suffix"}
declare -a EXP_ANS=("y" "n" "")
#echo "The Script in Running in $SCRIPT_DIR"
#echo "Base Dir for CG is $BASE_DIR"

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
    read -p "Enter the Image NAME which will be used to tag the Frontend Image (Default Name: chaosgenius-webapp): " temp_FIMAGE_NAME
    FIMAGE_NAME=$(echo $temp_FIMAGE_NAME | xargs)
    read -p "Enter the Image TAG which will be assigned to the new Frontend Image (Default Tag: latest): " temp_FIMAGE_TAG
    FIMAGE_TAG=$(echo $temp_FIMAGE_TAG | xargs)
    
    if [ "$FIMAGE_NAME" = '' ];
    then
        FIMAGE_NAME='chaosgenius-webapp'
    fi

    if [ "$FIMAGE_TAG" = '' ];
    then
        FIMAGE_TAG='latest'
    fi
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
    read -p "Enter the Image NAME which will be used to tag the Backend Image (Default Name: chaosgenius-server): " temp_BIMAGE_NAME
    BIMAGE_NAME=$(echo $temp_BIMAGE_NAME | xargs)
    read -p "Enter the Image TAG which will be assigned to the new Backend Image (Default Tag: latest): " temp_BIMAGE_TAG
    BIMAGE_TAG=$(echo $temp_BIMAGE_TAG | xargs)

    if [ "$BIMAGE_NAME" = '' ];
    then
        BIMAGE_NAME='chaosgenius-server'
    fi

    if [ "$BIMAGE_TAG" = '' ];
    then
        BIMAGE_TAG='latest'
    fi
fi

echo ""

if [ "$ans1" = 'y' ] || [ "$ans1" = '' ];
then
    echo "Building Frontend Image ......"
    docker build -t $FIMAGE_NAME:$FIMAGE_TAG "$BASE_DIR/frontend-new/"
    echo
fi

if [ "$ans2" = 'y' ] || [ "$ans2" = '' ];
then
    echo "Building Backend Image ......."
    docker build -t $BIMAGE_NAME:$BIMAGE_TAG $BASE_DIR
    echo
fi

#echo "Images Created :"
#docker images | grep '$BIMAGE_NAME\|$FIMAGE_NAME'

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

echo "Exiting...."
