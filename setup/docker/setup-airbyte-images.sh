#!/bin/bash

echo "#############################################"
echo "FETCHING THIRD PARTY DEPENDENCIES"
echo "#############################################"

#TODO: check if images exist before pulling


#declare -a image_names=("airbyte/source-google-ads:0.1.8" "airbyte/source-postgres:0.3.9" "airbyte/source-snowflake:0.1.1" "airbyte/source-mysql:0.4.3" "airbyte/source-bing-ads:0.1.0" "airbyte/source-google-sheets:0.2.4" "airbyte/source-shopify:0.1.12" "airbyte/source-stripe:0.1.16" "airbyte/source-bigquery:0.1.1" "airbyte/source-facebook-marketing:0.2.14" "airbyte/source-googleanalytics-singer:0.2.6")

#for image in "${image_names[@]}"
#do
    #docker pull $image
#done

if  [ "$SOURCE_GOOGLE_ADS" = 'true' ];
then
    docker pull airbyte/source-google-ads:0.1.8
fi

if  [ "$SOURCE_POSTGRES" = 'true' ];
then
    docker pull airbyte/source-postgres:0.3.9
fi

if  [ "$SOURCE_SNOWFLAKE" = 'true' ]; 
then
    docker pull airbyte/source-snowflake:0.1.1
fi

if  [ "$SOURCE_MYSQL" = 'true' ];
then
    docker pull airbyte/source-mysql:0.4.3
fi

if  [ "$SOURCE_BING_ADS" = 'true' ];
then
    docker pull airbyte/source-bing-ads:0.1.0
fi

if  [ "$SOURCE_GOOGLE_SHEETS" = 'true' ];
then
    docker pull airbyte/source-google-sheets:0.2.4
fi

if  [ "$SOURCE_SHOPIFY" = 'true' ];
then
    docker pull airbyte/source-shopify:0.1.12
fi

if  [ "$SOURCE_STRIPE" = 'true' ];
then
    docker pull airbyte/source-stripe:0.1.16
fi

if  [ "$SOURCE_GOOGLE_BIG_QUERY" = 'true' ];
then
    docker pull airbyte/source-bigquery:0.1.1
fi

if  [ "$SOURCE_FACEBOOK_ADS" = 'true' ];
then
    docker pull airbyte/source-facebook-marketing:0.2.14
fi

if  [ "$SOURCE_GOOGLE_ANALYTICS" = 'true' ];
then
    docker pull airbyte/source-googleanalytics-singer:0.2.6
fi
