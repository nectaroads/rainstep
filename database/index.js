const { startExpressServer } = require("./source/express");
const { formatConsole } = require("./source/utilities");

function onStart() {
    console.clear();
    console.log(formatConsole(`[Setup] Booting application: ${new Date().toLocaleTimeString()}`))

    startExpressServer();
}

onStart();