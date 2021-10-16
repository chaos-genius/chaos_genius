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
echo
docker images 

echo
read -p "Push Frontend Image ?(y/n): " temp_ans1
ans1=$(echo $temp_ans1 | xargs)
while [[ ! " ${EXP_ANS[*]} " =~ " ${ans1} " ]];
do
    echo "unexpected Input - $ans1, Enter 'y' or press Enter for yes, Enter 'n' for no"
    read -p "Push Frontend Image ?(y/n): " temp_ans1
    ans1=$(echo $temp_ans1 | xargs)
done

if [ "$ans1" = 'y' ] || [ "$ans1" = '' ];
then
    ftags=$(docker images | grep $FRONTEND_REPO | awk '{print $2}')
    
    if [ "$ftags" != "" ];
    then
        echo "The following are the frontend images present locally"
        echo
        docker image ls $FRONTEND_REPO
    
        #ftags=$(docker images | grep $FRONTEND_REPO | awk '{print $2}')
        ftags_list=(${ftags// / })

        echo
        read -p "Enter the Tag you wish to push to the repository: " temp_FTAG
        FTAG=$(echo $temp_FTAG | xargs)
        while [[ ! " ${ftags_list[*]} " =~ " ${FTAG} " ]];
        do
            echo "unexpected Input - The tag '$FTAG' does not exist, Try again"
            echo "The following is the list of tags that exist locally"

            echo
            for i in "${ftags_list[@]}"
            do
                echo $i
            done
            echo
            read -p "Enter the Tag you wish to push to the repository: " temp_FTAG
            FTAG=$(echo $temp_FTAG | xargs)
        done
    else
        echo
        echo "There are no chaosgenius Frontend Images present locally, build them by running the build script - docker-build.sh"
        flag1="false"
    fi

fi



echo
read -p "Push Backend/Server Image ?(y/n): " temp_ans2
ans2=$(echo $temp_ans2 | xargs)
while [[ ! " ${EXP_ANS[*]} " =~ " ${ans2} " ]];
do
    echo "unexpected Input - $ans2, Enter 'y' or press Enter for yes, Enter 'n' for no"
    read -p "Push Frontend Image ?(y/n): " temp_ans2
    ans2=$(echo $temp_ans2 | xargs)
done

if [ "$ans2" = 'y' ] || [ "$ans2" = '' ];
then
    btags=$(docker images | grep $BACKEND_REPO | awk '{print $2}')
    if [ "$btags" != "" ];
    then
        echo "The following are the backend images present locally"
        echo
        docker image ls $BACKEND_REPO
    
        # btags=$(docker images | grep $BACKEND_REPO | awk '{print $2}')
        btags_list=(${btags// / })
    
        echo
        read -p "Enter the Tag you wish to push to the repository: " temp_BTAG
        BTAG=$(echo $temp_BTAG | xargs)
        while [[ ! " ${btags_list[*]} " =~ " ${BTAG} " ]];
        do
            echo "unexpected Input - The tag '$BTAG' does not exist, Try again"
            echo "The following is the list of tags that exist locally"

            echo
            for j in "${btags_list[@]}"
            do
                echo $j
            done
            echo
            read -p "Enter the Tag you wish to push to the repository" temp_BTAG
            BTAG=$(echo $temp_BTAG | xargs)
        done
    else
        echo
        echo "There are no chaosgenius Backend Images present locally, build them by running the build script - docker-build.sh"
        flag2="false"
    fi


fi


if ([ "$ans1" = 'y' ] || [ "$ans1" = '' ]) && [ "$flag1" != "false" ] ;
then
    echo
    echo "Pushing the Frontend Image"
    echo
    docker push $FRONTEND_REPO:$FTAG
fi

if ([ "$ans2" = 'y' ] || [ "$ans2" = '' ]) && [ "$flag2" != "false" ] ;
then
    echo
    echo "Pushing the Backend Image"
    echo
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

if ([ "$ans3" = 'y' ] || [ "$ans3" = '' ]) && ([ "$flag1" != "false" ] && [ "$flag2" != "false" ]);
then
    if [ "$FTAG" != "" ];
    then
        fid=$(docker images | grep $FRONTEND_REPO | grep $FTAG | awk '{print $3}')
    fi

    if [ "$BTAG" != "" ];
    then
        bid=$(docker images | grep $BACKEND_REPO | grep $BTAG | awk '{print $3}')
    fi

    declare -a image_ids=("$fid" "$bid")
    
    for id in "${image_ids[@]}"
    do
        docker rmi -f $id
    done
fi

