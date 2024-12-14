const { sendAxiosRequest } = require("./axios");
const { Player, Song } = require("./classes");
const { formatConsole, isColliding } = require("./utilities");
const config = require('../config.json');

let lastTimestamp = 0;
let consts = { TPS: 60, }
let memory = { difficulty: 1, cholera: 1, boundary: 100, playerHitbox: 20, connectionId: 0, spawnId: 0, hazards: { challenger: 'Placeholder', patience: 1, rhythm: 1, arsenal: [[]], spawned: [new Song(86, 67, 90, 0), new Song(12, 37, 23, 1)] }, connections: [], sockets: [] };

function updateCollisions(deltaTime) {
    memory.connections.forEach(player => {
        memory.hazards.spawned.forEach(weapon => {
            const collision = isColliding(player, weapon);
            if (!collision || player.grace > 0) return;
            player.health -= 1;
            player.grace = 1;
        });
    });
};

function updateEnvironment(deltaTime) {
    if (memory.hazards.spawned.length <= 0) return;
    memory.hazards.spawned.forEach(weapon => {
        if (weapon.grace > 0) return;
        const radians = (Math.PI / 180) * (weapon.angle + 90);
        const dx = Math.cos(radians) * weapon.velocity * deltaTime;
        const dy = Math.sin(radians) * weapon.velocity * deltaTime;
        weapon.x += dx;
        weapon.y += dy;
        weapon.grace -= deltaTime;
    });
}

function updatePlayers(deltaTime) {
    memory.connections.forEach(player => {
        player.grace -= deltaTime;
        player.points += deltaTime;
        const socket = memory.sockets.find(connection => connection.connection === player.connection)?.socket;
        if (!socket) return;
        const connections = memory.connections.filter(otherPlayer => otherPlayer.connection !== player.connection).map(({ connection, ...rest }) => rest);
        socket.send(JSON.stringify({ type: 'onUpdate', player: player, connections, hazards: memory.hazards }));
    });
}

function serverUpdate() {
    if (memory.connections.length > 0) {
        if (lastTimestamp == 0) lastTimestamp = Date.now();
        const currentTimestamp = Date.now();
        const deltaTime = (currentTimestamp - lastTimestamp) / 1000;
        lastTimestamp = currentTimestamp;
        updateCollisions(deltaTime);
        updateEnvironment(deltaTime);
        updatePlayers(deltaTime);
    }
    setTimeout(serverUpdate, 1000 / consts.TPS);
}

const handleSocketMessages = {
    'onConnect': (socket, data) => {
        memory.connections.push(new Player(data.username, data.color, socket._sender._socket.remoteAddress, memory.connectionId));
        memory.sockets.push({ socket: socket, connection: socket._sender._socket.remoteAddress });
        socket.send(JSON.stringify({ type: 'onConnect' }));
        memory.connectionId++;
        if (memory.connectionId === 1) serverUpdate();
    },

    'onMove': (socket, data) => {
        const player = memory.connections.find((player) => player.connection === socket._sender._socket.remoteAddress);
        if (!player) return;
        if (data.pressedKeys['w']) player.position.top = Math.max(-memory.boundary, player.position.top - player.velocity);
        else if (data.pressedKeys['s']) player.position.top = Math.min(memory.boundary, player.position.top + player.velocity);
        if (data.pressedKeys['a']) player.position.left = Math.max(-memory.boundary, player.position.left - player.velocity);
        else if (data.pressedKeys['d']) player.position.left = Math.min(memory.boundary, player.position.left + player.velocity);
    }
};

function onSocketConnection(socket) {
    console.log(formatConsole(`[Server] Connection Stablished: ${socket._sender._socket.remoteAddress}`));
}

function onSocketMessage(socket, argument) {
    const data = JSON.parse(argument);
    handleSocketMessages[data.type](socket, data);
}

function onSocketClose(socket) {
    const index = memory.connections.findIndex(player => player.connection === socket._sender._socket.remoteAddress);
    const player = memory.connections[index];
    sendAxiosRequest('api', JSON.stringify({ key: config.expressServer.key, type: 'push', player: { username: player.username, connection: player.connection, points: player.points } }));
    memory.connections.splice(index, 1);
    memory.sockets = memory.sockets.filter(s => s.connection !== socket._sender._socket.remoteAddress);
    console.log(formatConsole(`[Server] Connection interrupted: ${socket._sender._socket.remoteAddress}`));
}

module.exports = { onSocketConnection, onSocketMessage, onSocketClose };