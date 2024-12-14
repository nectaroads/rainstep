const axios = require('axios');
const config = require('../config.json');

function sendAxiosRequest(route, data) {
    axios.post(`http://${config.expressServer.host}:${config.expressServer.port}/${route}`, data, {
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            console.log(response.data.log);
        })
        .catch(error => {
            console.error(response.data.log);
        });
}

module.exports = { sendAxiosRequest };
