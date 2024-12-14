const express = require('express');
const config = require('../config.json');
const { handleRequest, loadDatabase } = require('./handler');
const bodyParser = require('body-parser');
const { formatConsole } = require('./utilities');

const app = express();
app.use(bodyParser.json());

app.post("/api", (req, res) => {
    const body = req.body;
    if (!body || config.key != body?.key) return;
    handleRequest(body, res);
});

function startExpressServer() {
    return new Promise((resolve, reject) => {
        app.listen(config.port, config.host, (error) => {
            if (error) reject(error);
            console.log(formatConsole(`[Setup] Booting application on: ${config.host}:${config.port}`));
            resolve();
        });
    }).then(() => {
        loadDatabase();
    });
}

module.exports = { startExpressServer };