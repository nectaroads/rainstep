function formatConsole(string) {
    const colors = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        violet: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        black: '\x1b[30m',
    };

    const tagColors = {
        Setup: colors.green,
        Status: colors.violet,
        Error: colors.red,
        Server: colors.yellow,
        Client: colors.cyan
    };

    const match = string.match(/\[(.*?)\](.*?):(.*)/);

    if (match) {
        const [, insideBrackets, beforeColon, afterColon] = match;
        const tagColor = tagColors[insideBrackets] || colors.blue;
        const formattedString = `${tagColor}[${insideBrackets}]${colors.reset}${beforeColon}: ${colors.blue}${afterColon.trim()}${colors.reset}`;
        return formattedString;
    }

    return string;
}

function isColliding(player, object) {
    const playerVertices = getPlayerVertices(player);
    const objectVertices = getRotatedVertices(object);

    function projectVertices(vertices, axis) {
        return vertices.map(v => v.x * axis.x + v.y * axis.y);
    }

    function checkCollision(verticesA, verticesB) {
        for (let i = 0; i < verticesA.length; i++) {
            const p1 = verticesA[i];
            const p2 = verticesA[(i + 1) % verticesA.length];
            const axis = { x: -(p2.y - p1.y), y: p2.x - p1.x };

            const projectionA = projectVertices(verticesA, axis);
            const projectionB = projectVertices(verticesB, axis);

            const minA = Math.min(...projectionA);
            const maxA = Math.max(...projectionA);
            const minB = Math.min(...projectionB);
            const maxB = Math.max(...projectionB);

            if (maxA < minB || maxB < minA) return false;
        }
        return true;
    }

    return (
        checkCollision(playerVertices, objectVertices) &&
        checkCollision(objectVertices, playerVertices)
    );
}

function getRotatedVertices(object) {
    const radians = (Math.PI / 180) * object.angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const halfWidth = object.width / 2;
    const halfHeight = object.height / 2;

    return [
        { x: object.position.left - halfWidth * cos + halfHeight * sin, y: object.position.top - halfWidth * sin - halfHeight * cos },
        { x: object.position.left + halfWidth * cos + halfHeight * sin, y: object.position.top + halfWidth * sin - halfHeight * cos },
        { x: object.position.left + halfWidth * cos - halfHeight * sin, y: object.position.top + halfWidth * sin + halfHeight * cos },
        { x: object.position.left - halfWidth * cos - halfHeight * sin, y: object.position.top - halfWidth * sin + halfHeight * cos }
    ];
}

function getPlayerVertices(player) {
    return [
        { x: player.position.left, y: player.position.top },
        { x: player.position.left + player.hitbox, y: player.position.top },
        { x: player.position.left + player.hitbox, y: player.position.top + player.hitbox },
        { x: player.position.left, y: player.position.top + player.hitbox }
    ];
}

module.exports = { formatConsole, getPlayerVertices, getRotatedVertices, isColliding };
