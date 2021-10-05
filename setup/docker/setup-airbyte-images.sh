echo "#############################################"
echo "FETCHING THIRD PARTY DEPENDENCIES"
echo "#############################################"

#TODO: check if images exist before pulling

declare -a image_names=("airbyte/source-google-ads:0.1.8" "airbyte/source-postgres:0.3.9" "airbyte/source-snowflake:0.1.1" "airbyte/source-mysql:0.4.3" "airbyte/source-bing-ads:0.1.0" "airbyte/source-google-sheets:0.2.4" "airbyte/source-shopify:0.1.12" "airbyte/source-stripe:0.1.16" "airbyte/source-bigquery:0.1.1" "airbyte/source-facebook-marketing:0.2.14" "airbyte/source-googleanalytics-singer:0.2.6")

for image in "${image_names[@]}"
do
    docker pull $image
done