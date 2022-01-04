#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
suffix="/scripts/docker"
BASE_DIR=${SCRIPT_DIR%"$suffix"}

echo "###### REMOVING CONTAINERS #######################"
echo
echo "Select the .yml that was used to start Chaos Genius"
yml_files=$(ls $BASE_DIR/docker-compose*yml)
yml_files_list=(${yml_files// / })
declare -i count=1
echo
for file in "${yml_files_list[@]}"
do
    echo $count . ${file#"$BASE_DIR/"}
    count=`expr $count + 1`
done
echo
read -p "Your selection? Press Enter if unsure: " temp_sel
sel=$(echo $temp_sel | xargs)
sel=`expr $sel`

if [ "$sel" = "" ];
then
    declare -a cont_list=("chaos_genius_chaosgenius-server_1" "chaos_genius_celery-worker_1" "chaos_genius_celery-scheduler_1" "airbyte-temporal" "chaos_genius_chaosgenius-webapp_1" "chaos_genius_chaosgenius-db_1" "chaos_genius_redis_1" "airbyte-webapp" "airbyte-db" "init" "airbyte-scheduler" "airbyte-server" "chaosgenius-server" "chaosgenius-webapp" "chaosgenius-db" "chaosgenius-scheduler" "chaosgenius-worker-alerts" "chaosgenius-worker-analytics" "init" "chaosgenius-init" "chaosgenius-redis")

    for cont in "${cont_list[@]}"
    do
        docker stop $cont
        docker rm $cont
    done
    echo "removed containers successfully"
else
    declare -i index=`expr $sel - 1`
    compose_file=${yml_files_list[$index]}
    docker-compose -f $compose_file down
    docker-compose -f $compose_file rm -v -f
fi


echo "###### CLEANING UP LOCAL DIRECTORIES #############"
rm -rf $BASE_DIR/docker/airbyte-db
rm -rf $BASE_DIR/docker/cg-db
rm -rf /tmp/workspace
rm -rf /tmp/airbyte_local
echo "Done"

echo "###### CLEANING UP DOCKER VOLUMES ################"
docker volume rm cg_db airbyte_data airbyte_db airbyte_workspace
echo "Done"

echo "###### REMOVING ALL RELATED IMAGES ###############"
declare -a image_names=("airbyte/webapp" "airbyte/server" "airbyte/worker" "airbyte/scheduler" "airbyte/db" "airbyte/init" "airbyte/source-google-ads" "airbyte/source-postgres" "airbyte/source-snowflake" "airbyte/source-mysql" "airbyte/source-bing-ads" "airbyte/source-google-sheets" "airbyte/source-shopify" "airbyte/source-stripe" "airbyte/source-bigquery" "airbyte/source-facebook-marketing" "airbyte/source-googleanalytics-singer" "temporalio/auto-setup" "redis" "node" "postgres" "chaosgenius/chaosgenius-server" "chaosgenius/chaosgenius-webapp" "docker")

for image in "${image_names[@]}"
do
  image_id=$(docker images | grep "$image" | awk '{print $3}')
  if [ ! -z "$image_id" ]
  then 
    echo "$image - image found. Deleting image........"
    docker rmi -f $image_id
  else 
    echo "$image - image not found"
  fi
done
echo "##### SUCCESSFULLY REMOVED CHAOSGENIUS #########"
