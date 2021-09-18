FROM node:14

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

RUN npm run build

COPY . .