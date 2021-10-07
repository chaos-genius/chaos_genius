FROM node:14

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

RUN npm run build
