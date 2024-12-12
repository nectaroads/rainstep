class Player {
    constructor(username, color, connection, id) {
        this.username = username;
        this.connection = connection;
        this.health = 10;
        this.points = 0;
        this.position = { top: 0, left: 0 };
        this.grace = 5;
        this.color = color;
        this.id = id;
    }

    getId() {
        return this.id;
    }

    getDamage(amount = 1) {
        if (this.grace <= 0) return false;
        this.health -= amount;
        return this.health <= 0;
    }

    getPositionTop() {
        return this.position.top;
    }

    setPositionTop(position) {
        this.position.top = position;
    }

    getPositionLeft() {
        return this.position.left;
    }

    setPositionLeft(position) {
        this.position.left = position;
    }

    getConnection() {
        return this.connection;
    }

    getEverything() {
        return { ...this };
    }

    getFiltered() {
        return { username: this.username, position: this.position, color: this.color };
    }
}

class Weapons {
    constructor(x, y, angle) {
        this.angle = angle
        this.x = x
        this.y = y;
    }

    getVelocity() {
        return this.velocity;
    }

    getGrace(deltaTime) {
        this.grace -= deltaTime;
        return this.grace;
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    getX() {
        return this.x;
    }

    setX(x) {
        this.x = x;
    }

    getY() {
        return this.y;
    }

    setY(y) {
        this.y = y;
    }

    getAngle() {
        return this.angle;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }
}

class Feather extends Weapons {
    constuctor(x, y, angle) {
        this.height = 12;
        this.width = 8;
    }
}

module.exports = { Player };