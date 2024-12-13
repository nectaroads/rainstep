const express = require('express');
const config = require('../config.json');
const { handleRequest } = require('./handler');

const app = express();
app.use(bodyParser.json());

app.post("/api", (req, res) => {
    const body = req.body;
    if (!body) return;
    handleRequest(body, res);
});

function startExpress() {
    return new Promise((resolve, reject) => {
        app.listen(config.port, config.host, (error) => {
            if (error) reject(error);
            console.log(formatConsole(`[Setup] Booting application on: ${config.client.ports.express}`));
            resolve();
        });
    });
}

module.exports = { startExpress };