#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
suffix="/scripts/docker"
BASE_DIR=${SCRIPT_DIR%"$suffix"}
FRONTEND_REPO="chaosgenius/chaosgenius-webapp"
BACKEND_REPO="chaosgenius/chaosgenius-server"
declare -a EXP_ANS=("y" "n" "")

get_tags_list () {
    tags=$(wget -q https://registry.hub.docker.com/v1/repositories/$1/tags -O -  | sed -e 's/[][]//g' -e 's/"//g' -e 's/ //g' | tr '}' '\n'  | awk -F: '{print $3}')
    #tags_list=(${tags// / })
    echo $tags
}


echo "The following are the available local docker images:"
docker images

echo
read -p "Push Frontend Image ?(y/n) " temp_ans1
ans1=$(echo $temp_ans1 | xargs)
while [[ ! " ${EXP_ANS[*]} " =~ " ${ans1} " ]];
do
    echo "unexpected Input - $ans1, Enter 'y' or press Enter for yes, Enter 'n' for no"
    read -p "Push Frontend Image ?(y/n) " temp_ans1
    ans1=$(echo $temp_ans1 | xargs)
done

if [ "$ans1" = 'y' ] || [ "$ans1" = '' ];
then
    echo "Select the frontend image"
    
    read -p "Enter the image Name along with Tag of the image you want to push (Ex- chaosgenius-webapp:0.1.0): " temp_FIMAGE
    FIMAGE=$(echo $temp_FIMAGE | xargs)
    fimage_arr=(${FIMAGE//":"/ })
    lftag=${fimage_arr[1]}
    FIMAGE_NAME=${fimage_arr[0]}

    echo "Following are the tags present in the Frontend Repository ( $FRONTEND_REPO ):"
    ftags=$(get_tags_list $FRONTEND_REPO)
    ftags_list=(${ftags// / })
    
    echo
    for i in "${ftags_list[@]}"
    do
        echo $i
    done

    echo
    read -p "Enter the Tag to push the new image to (Default - same tag as the new image i.e $lftag ): " temp_FTAG
    FTAG=$(echo $temp_FTAG | xargs)
    
    if [ "$FTAG" = '' ];
    then
        FTAG=$lftag
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



echo
read -p "Push Backend/Server Image ?(y/n) " temp_ans2
ans2=$(echo $temp_ans2 | xargs)
while [[ ! " ${EXP_ANS[*]} " =~ " ${ans2} " ]];
do
    echo "unexpected Input - $ans2, Enter 'y' or press Enter for yes, Enter 'n' for no"
    read -p "Push Frontend Image ?(y/n) " temp_ans2
    ans2=$(echo $temp_ans2 | xargs)
done

if [ "$ans2" = 'y' ] || [ "$ans2" = '' ];
then
    echo "Select the backend/server image"

    read -p "Enter the image Name along with Tag of the image you want to push (Ex- chaosgenius-server:0.1.0 ): " temp_BIMAGE
    BIMAGE=$(echo $temp_BIMAGE | xargs)
    bimage_arr=(${BIMAGE//":"/ })
    lbtag=${bimage_arr[1]}
    BIMAGE_NAME=${bimage_arr[0]}

    echo "Following are the tags present in the Backend Repository ( $BACKEND_REPO ):"
    btags=$(get_tags_list $BACKEND_REPO)
    btags_list=(${btags// / })
    
    echo
    for j in "${btags_list[@]}"
    do
        echo $j
    done
    
    echo
    read -p "Enter the Tag to push the new image to (Default - same tag as the new image i.e $lbtag ): " temp_BTAG
    BTAG=$(echo $temp_BTAG | xargs)
    
    if [ "$BTAG" = '' ];
    then
        BTAG=$lbtag
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


if [ "$ans1" = 'y' ] || [ "$ans1" = '' ];
then
    docker tag $FIMAGE $FRONTEND_REPO:$FTAG
    docker push $FRONTEND_REPO:$FTAG
fi

if [ "$ans2" = 'y' ] || [ "$ans2" = '' ];
then
    docker tag $BIMAGE $BACKEND_REPO:$BTAG
    docker push $BACKEND_REPO:$BTAG
fi

read -p "Remove the local images ? (y/n): " temp_ans3
ans3=$(echo $temp_ans3 | xargs)
while [[ ! " ${EXP_ANS[*]} " =~ " ${ans3} " ]];
do
    echo "unexpected Input - $ans3, Enter 'y' or press Enter for yes, Enter 'n' for no"
    read -p "Push Frontend Image ?(y/n) " temp_ans3
    ans3=$(echo $temp_ans3 | xargs)
done

if [ "$ans3" = 'y' ] || [ "$ans3" = '' ];
then
    declare -a image_names=("$FIMAGE_NAME" "$BIMAGE_NAME")

    for image in "${image_names[@]}"
    do
        if [ $image != "" ];
        then
            image_id=$(docker images | grep "$image" | awk '{print $3}')
            if [ ! -z "$image_id" ]
            then 
                echo "Image found. Deleting image........"
                docker rmi -f $image_id
            else 
                echo "image not found"
            fi
        fi
    done
fi

