const config = require('./config.json');
const { startSocketServer } = require('./source/socket');
const { formatConsole } = require('./source/utilities');

function onStart() {
    console.clear();
    console.log(formatConsole(`[Setup] Booting application: ${new Date().toLocaleTimeString()}`))

    startSocketServer(config.socketServer.host, config.socketServer.port);
}

onStart();