#!/bin/bash

while ! timeout 1 bash -c "echo > /dev/tcp/server/8001"; do   
  sleep 1
done
flask db upgrade
flask integration-connector
echo '
   ________                        ______           _               
  / ____/ /_  ____ _____  _____   / ____/__  ____  (_)_  _______    
 / /   / __ \/ __ `/ __ \/ ___/  / / __/ _ \/ __ \/ / / / / ___/    
/ /___/ / / / /_/ / /_/ (__  )  / /_/ /  __/ / / / / /_/ (__  )     
\____/_/ /_/\__,_/\____/____/   \____/\___/_/ /_/_/\__,_/____/      
                                                                    
'
gunicorn -w 4 run:app --bind 0.0.0.0:5000
