#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
suffix="/scripts/docker"
BASE_DIR=${SCRIPT_DIR%"$suffix"}


echo "########### REMOVING OLD CONTAINERS ################"
declare -a cont_list=("chaos_genius_chaosgenius-server_1" "chaos_genius_celery-worker_1" "chaos_genius_celery-scheduler_1" "airbyte-temporal" "chaos_genius_chaosgenius-webapp_1" "chaos_genius_chaosgenius-db_1" "chaos_genius_redis_1" "airbyte-webapp" "airbyte-db" "init" "airbyte-scheduler" "airbyte-server" "chaosgenius-server" "chaosgenius-webapp" "chaosgenius-db" "chaosgenius-scheduler" "chaosgenius-worker-alerts" "chaosgenius-worker-analytics" "init" "chaosgenius-init" "chaosgenius-redis")

for cont in "${cont_list[@]}"
do
    docker stop $cont
    docker rm $cont
done
echo "removed containers successfully"

echo "#### CLEANING UP LOCAL DIRECTORIES ###############"
rm -rf /tmp/workspace
rm -rf /tmp/airbyte_local
rm -rf $BASE_DIR/docker/cg-db
rm -rf $BASE_DIR/docker/airbyte-db
echo "Done"

echo "####### REMOVING ALL RELATED IMAGES ##############"
declare -a image_names=("chaos_genius_celery-scheduler" "chaos_genius_celery-worker" "chaos_genius_chaosgenius-server" "chaos_genius_chaosgenius-webapp" "airbyte/webapp" "airbyte/server" "airbyte/worker" "airbyte/scheduler" "airbyte/db" "airbyte/init" "airbyte/source-google-ads" "airbyte/source-postgres" "airbyte/source-snowflake" "airbyte/source-mysql" "airbyte/source-bing-ads" "airbyte/source-google-sheets" "airbyte/source-shopify" "airbyte/source-stripe" "airbyte/source-bigquery" "airbyte/source-facebook-marketing" "airbyte/source-googleanalytics-singer" "temporalio/auto-setup" "redis" "node" "postgres" "chaosgenius/chaosgenius-server" "chaosgenius/chaosgenius-webapp")

for image in "${image_names[@]}"
do
  image_id=$(docker images | grep "$image" | awk '{print $3}')
  if [ ! -z "$image_id" ]
  then 
    echo "Image found. Deleting image........"
    docker rmi -f $image_id
  else 
    echo "image not found"
  fi
done
echo "##### SUCCESSFULLY REMOVED CHAOSGENIUS #########"
