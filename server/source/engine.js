const { Player } = require("./classes");
const { formatConsole, isColliding } = require("./utilities");

let lastTimestamp = 0;
let consts = { TPS: 60, }
let memory = { difficulty: 1, cholera: 1, velocity: 3, boundary: 100, playerHitbox: 20, connectionId: 0, spawnId: 0, hazards: { challenger: 'Placeholder', patience: 1, rhythm: 1, arsenal: [[]], spawned: [], }, connections: [], sockets: [] };

function updateCollisions() {
    memory.connections.forEach(player => {
        memory.hazards.spawned.forEach(weapon => {
            const collision = isColliding(player, weapon);
            if (collision) player.getDamage();
        });
    });
};

function updateEnvironment(deltaTime) {
    if (memory.hazards.spawned.length <= 0) return;
    memory.hazards.spawned.foreach(weapon => {
        const grace = weapon.getGrace(deltaTime);
        if (grace > 0) return;
        const radians = (Math.PI / 180) * (weapon.getAngle() + 90);
        const dx = Math.cos(radians) * weapon.getVelocity() * deltaTime;
        const dy = Math.sin(radians) * weapon.getVelocity() * deltaTime;

        weapon.setX() = weapon.getX() + dx;
        weapon.setY() = weapon.getY() + dy;
    });
}

function updatePlayers(deltaTime) {
    memory.connections.forEach(player => {
        const socket = memory.sockets.find(connection => connection.connection === player.connection)?.socket;
        if (!socket) return;
        const connections = memory.connections.filter(otherPlayer => otherPlayer.connection !== player.connection).map(({ connection, ...rest }) => rest);
        socket.send(JSON.stringify({ type: 'onUpdate', player: player, connections, hazards: memory.hazards }));
    });
}

function serverUpdate() {
    if (memory.connections.length > 0) {
        const currentTimestamp = Date.now();
        const deltaTime = (currentTimestamp - lastTimestamp) / 1000;
        lastTimestamp = currentTimestamp;
        updateCollisions();
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
        if (memory.connectionId == 0) serverUpdate();
        memory.connectionId++;
    },

    'onMove': (socket, data) => {
        const player = memory.connections.find((player) => player.getConnection() === socket._sender._socket.remoteAddress);
        if (!player) return;
        if (data.pressedKeys['w']) player.setPositionTop(Math.max(-memory.boundary, player.getPositionTop() - memory.velocity));
        else if (data.pressedKeys['s']) player.setPositionTop(Math.min(memory.boundary, player.getPositionTop() + memory.velocity));
        if (data.pressedKeys['a']) player.setPositionLeft(Math.max(-memory.boundary, player.getPositionLeft() - memory.velocity));
        else if (data.pressedKeys['d']) player.setPositionLeft(Math.min(memory.boundary, player.getPositionLeft() + memory.velocity));
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
    memory.connections = memory.connections.filter(player => player.getConnection() !== socket._sender._socket.remoteAddress);
    memory.sockets = memory.sockets.filter(s => s.connection !== socket._sender._socket.remoteAddress);
    console.log(formatConsole(`[Server] Connection interrupted: ${socket._sender._socket.remoteAddress}`));
}

module.exports = { onSocketConnection, onSocketMessage, onSocketClose, serverUpdate };