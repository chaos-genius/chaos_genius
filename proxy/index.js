const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');

const dotenv = require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

const CHAOSGENIUS_WEBAPP_URL = dotenv.parsed.CHAOSGENIUS_WEBAPP_URL
const REACT_APP_PROXY_PORT = +dotenv.parsed.REACT_APP_PROXY_PORT || 1337;

const proxy = httpProxy.createProxyServer({});
const server = http.createServer(function (req, res) {
    if (req.url.includes('/api/')) {
        // re-route all requests to the default port 8080
        proxy.web(req, res, { target: CHAOSGENIUS_WEBAPP_URL });
    } else {
        // The default port for CRA npm start is 3000
        proxy.web(req, res, { target: 'http://localhost:3000' });
    }
});

console.log(`Listening to port ${REACT_APP_PROXY_PORT}`);
server.listen(REACT_APP_PROXY_PORT);
