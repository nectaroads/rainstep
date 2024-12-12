const { WebSocket } = require("ws");
const { formatConsole } = require("./utilities");
const { onSocketConnection, onSocketMessage, onSocketClose } = require("./engine");

function startSocketServer(host, port) {
    console.log(formatConsole(`[Setup] Booting Socket-Server on: ${host}:${port}`));

    const webSocket = new WebSocket.Server({ host, port });

    webSocket.on('connection', (socket) => {
        onSocketConnection(socket);
        socket.on('message', (message) => { onSocketMessage(socket, message) });
        socket.on('close', () => { onSocketClose(socket) });
    });

    console.log(formatConsole(`[Setup] Socket-Server started on: ${host}:${port}`));
}

module.exports = { startSocketServer };