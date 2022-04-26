# 🔮 Chaos Genius Contribution Guidelines

This document will help you get started with contributing to Chaos Genius.

Contribution does not always mean code. You can contribute to Chaos Genius in the following ways:
- Try Chaos Genius and share your feedback.
- Show us some love - Give us a star!
- Submit an issue if you find a bug or need a feature.
- Share a part of the documentation that you find difficult to follow.
- Improve our [documentation](https://github.com/chaos-genius/chaos-genius-docs).
- Translate our [README](https://github.com/chaos-genius/chaos_genius/blob/main/README.md).
- Send a PR for one of [our issues](https://github.com/chaos-genius/chaos_genius/issues). Please read [this section](#contributing) before starting.

Thank you for contributing!

The rest of this document will focus on code contributions to this repository.

## Assumptions

This document assumes that you:
1. Have basic familiarity with [git](https://docs.github.com/en/get-started/using-git/about-git) and the [Pull Requests](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests) (PR) workflow.
1. Have read some of the [Chaos Genius documentation](https://docs.chaosgenius.io).
1. Know about the [Chaos Genius community](https://docs.chaosgenius.io/docs/introduction#community). Please reach out to us for any help!

## Contributing

Follow these steps if you want to make a code contribution to Chaos Genius.

1. Find an [issue](https://github.com/chaos-genius/chaos_genius/issues) that you want to work on. If an issue does not exist for your problem, please create one.
    - Leave a comment on the issue indicating that you want to work on it.
    - Wait for one of the maintainers to confirm and provide more details on it (if required).
1. Clone the repository (you will need to create a [fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) if you're an external contributor).
    ```
    git clone https://github.com/chaos-genius/chaos_genius.git # for internal contributor
    ```
    or 
    
    ```
    git clone https://github.com/<your-github-username>/chaos_genius.git # for external contributors
    ```
    then 
    ```
    cd chaos_genius
    ```
1. Create a new [branch](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository) from `develop` branch
    - If you're an internal contributor, the branch must be named appropriately. Use `feature/` or `fix/` prefix as needed. An example of a good branch name is `feature/add-prophet-model`.
1. See [Development Workflow](#development-workflow) for setting up Chaos Genius locally and testing your changes.
1. Commit your changes while following the [commit guidelines](#git-commit-messages).
1. Open a [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) from your branch.
    - The PR must be directed to the `develop` branch (and not the `main` branch).
    - A maintainer will soon add appropriate tags and milestones.
    - Once your change is approved and the PR is merged, it will be available in the next release of Chaos Genius.

## Development Workflow

We support 3 different development workflows:
- [Gitpod](#gitpod): easiest and fastest way to get started. Has some minor [limitations](GITPOD.md#known-issues) but can be used in most cases.
- [Docker Compose](#docker-compose): if you have Docker and docker-compose set up locally, this is the fastest way to get started on your local system.
- [Local setup](#local-setup): if you prefer running it directly on your system (without layers like Docker), opt for this. It requires running a Postgres and a Redis server yourself and needs some set up.

### **Gitpod**

It can be quite a bit of work to set up Chaos Genius locally for development. Instead, you can use Gitpod which gives you everything you need to run and develop Chaos Genius but in a cloud environment and with the familiar interface of VS Code. See [GITPOD.md](./GITPOD.md) for details.

### **Docker Compose**

We have provided Docker Compose files specifically made for development. They include all the services (Postgres, Redis, etc.) along with auto-reloading backend server, workers and scheduler.

Note: this does not yet support development of the webapp/frontend. Use Gitpod or a local setup instead if you will be making changes to the webapp/frontend/UI.

Run the dev compose using:
```
docker-compose -f docker-compose.dev.yml up
```

If you will be testing third party data sources (go for the above if you're not sure), use this instead:
```
docker-compose -f docker-compose.dev-thirdparty.yml up
```

### **Local setup**

#### **Backend/API**

Prerequisites:
- Python 3.8 with `venv`
- A PostgreSQL server
- A Redis server

Steps to set up a development environment:

- Create a new python virtual environment.
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```
- Install the development requirements.
    ```
    pip install -r requirements/dev.txt
    ```
- Copy `.env.local.template` to `.env.local` and set appropriate variables.
    ```
    cp .env.local.template .env.local
    ```
    - In particular, you will need to change:
        - `DATABASE_URL_CG_DB` - change username, password, DB host and DB name as needed.
        - `CHAOSGENIUS_WEBAPP_URL` - this is the URL used in emails. For local dev setups, this can be `http://localhost:5000`.
        - `CELERY_RESULT_BACKEND` and `CELERY_BROKER_URL` - change the Redis host name as needed.
- Run the following command to start a local API server:
    ```
    bash dev_server.sh
    ```
- Note: this does not start any of the celery schedulers or workers, which are needed if you want to run any analytics.

#### **Frontend/UI/Webapp**

Prerequisites:

- Node JS

Steps to set up a development environment:

- The webapp is present in the `frontend` directory.
    ```
    cd frontend
    ```
- Install dependencies.
    ```
    npm i
    ```
- Create a `.env` file (while inside the `frontend` directory) and add the following to it (this is the URL of the API server):
    ```
    REACT_APP_BASE_URL=http://localhost:5000
    ```
- Start a local server.
    ```
    npm start
    ```
- A browser window should open at http://localhost:3000 with the webapp.

## Git guidelines

### Git commit messages

We will use Semantic Commit Messages, that are an adoption of Conventional Commits:

```
feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```

#### Description of each commit type:

1. feat: (new feature for the user, not a new feature for build script)
2. fix: (bug fix for the user, not a fix to a build script)
3. docs: (changes to the documentation)
4. style: (formatting, missing semi colons, etc; no production code change)
5. refactor: (refactoring production code, eg. renaming a variable)
6. test: (adding missing tests, refactoring tests; no production code change)
7. chore: (updating grunt tasks etc; no production code change)

Please look into Semantic Commit’s references for more information. 

#### A good thumb rule:

Commit message should talk about WHAT changed, and WHY. Not HOW – how is the diff, and you don’t need to repeat it.

### GitHub Pull Requests

- Describe your changes in the PR description. It can have minimal information if the commits describe the changes instead.
- Add the `don't merge` label if your PR is in-progress.
