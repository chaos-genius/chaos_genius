# Using Gitpod for Chaos Genius

Gitpod gives you a fully functional VS code environment in a web page<sup id="f1">[1](#fn1)</sup>. All the requirements, system dependencies and services are set up according to the project's specifications. You don't even need to set up Git. This lets you get started with contributing to Chaos Genius with no set up required.

Use this button to open a Gitpod workspace on Chaos Genius' `develop` branch:

<a href="https://gitpod.io/#https://github.com/chaos-genius/chaos_genius/tree/develop"><img src="https://gitpod.io/button/open-in-gitpod.svg"/></a>

- You may need to login with your GitHub account.
- It may take 5-10 mins for set up if the pre-build was not made or did not complete for some reason.

## Features

- A new page will open with a URL like `3000-chaosgenius-chaosgenius-<something>.gitpod.io`. This is the Chaos Genius webapp running on Gitpod. It is connected to the backend which runs on Gitpod too.
- Select "Remote Explorer" from the left side bar to see all the open ports. The "Open Browser" button will open the port in a new page (use this on port 3000 to get back the page mentioned in the previous point).
- All services required by Chaos Genius are running in separate terminals (see the right side bar of the terminal window)
    - `API Server` is the backend server. You will find the backend logs in this terminal.
        - Run `bash dev_server.sh` to restart the server if it had stopped for any reason.
    - `Webapp` is the frontend UI. You will find React build logs here. 
        - Use ```REACT_APP_BASE_URL=`gp url 5000` npm start``` to restart the webapp server if it had stopped.
    - `Redis` is the message broker used by Celery workers. You will not find anything useful in these logs.
        - Use `redis-server` to restart Redis if it had stopped.
    - `Workers and Scheduler` runs the Celery workers and Celery beat scheduler. You will find logs of analytics tasks (anomaly, DeepDrills, etc.), data source metadata pre-fetch, alerts (both individual and alert reports), etc.
        - Use `bash dev_workers.sh` to restart them if they had stopped.
- Use the `+` button in the terminal window to open a new shell. The python environment will be pre-activated, which allows you to use the Chaos Genius CLI (see `flask --help` for details).

### Docker compose support

If you need to test any functionality that only affects the docker compose deployments, you can use `docker-compose` directly from Gitpod. Both docker and docker-compose are pre-installed. The webapp will need to be accessed from port `8080` (use the Remote Explorer to make it public or to get the link).

## Known issues

- The workspace shuts down after 30 mins of inactivity on the default free plan.
    - There is also a 50 hours monthly limit.
- Sending emails via SMTP does not work inside Gitpod. See https://github.com/gitpod-io/gitpod/issues/965.

## Notes

<b id="fn1">1</b> You can even choose to open Gitpod on your system's VS code. Click on the first button on the left side-bar (the hamburger button) and select `Gitpod: Open in VS Code`. [↩](#f1)