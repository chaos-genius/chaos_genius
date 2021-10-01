echo "###### REMOVING CONTAINERS AND VOLUMES ###########"
docker-compose -f docker-compose-img.yml rm -f
docker volume prune -f

echo "#### CLEANING UP LOCAL DIRECTORIES ###############"
rm -rf docker/airbyte-db
rm -rf docker/cg-db
rm -rf /tmp/workspace
rm -rf /tmp/airbyte_local

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

