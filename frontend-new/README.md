# Chaos Genius - Static Design

React.js web application to manage employee loans.

## Development Setup

- Clone Repository: `git clone HTTPS/SSH Url`
- Move to root directory: `cd chaos-genius-static-design`
- Install dependency: `npm install`
- Starting Project: `npm start`
- Open link in browser: [http://localhost:3000/](http://localhost:3000/)

## Folder Structure

    chaos-genius-static-design
    │
    └───src
    │   │
    │   └───assets
    │       └───images (Director to store all image files)
    │       └───styles (Director to wrap all style dependencies of the application)
    │               └───common.scss (Parent style sheet where application level common styles are mentioned)
    │   |
    │   └───components (Parent directory for app components)
    │   │   └───resource folder (Resource folder for each specific component with CSS properties)
    │   |
    │   └───containers (Parent directory for app pages)
    │   │   └───resource folder (Each specific resource folder with CRUD operations)
    │   |
    │   └───utils (Parent directory for the application utils)
    │       └───constants.js (Application constant variables)
    │       └───cookie-helper.js (Cookie helper to handler browser storages)
    │       └───http-helper.js (HTTP warpper to handle all api communication)
    │       └───url-helper.js (URL helpers to resolve all back end points)
    │       └───user-helper.js (User class to handler authentication & authorization helpers)
    │   |
    │   └───routes (Parent directory for react pages)
    │       └───index.js (Router structure & settings)
    │       └───private-routes.js (Private route configuration & settings)

## Deployment

- Staging Deployment: run command on terminal `npm run testdeploy`

## Testing Server

[Start Testing](http://chaos-genius-dev.s3-website.ap-south-1.amazonaws.com)

## Developer Best Practice

- Maintain proper namespacing for folders, files, variable and function declarations.
- Format code using [Prettier](https://www.npmjs.com/package/prettier) package.
- Always create feature or bug branches and then merge with stable master branch.
- Provide proper commit messages & split commits meaningfully.
