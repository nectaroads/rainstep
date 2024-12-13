class Player {
    constructor(username, color, connection, id) {
        this.username = username;
        this.connection = connection;
        this.health = 5;
        this.points = 0;
        this.position = { top: 0, left: 0 };
        this.grace = 1;
        this.color = color;
        this.id = id;
        this.hitbox = 20;
        this.velocity = 1.75;
    }
}

class Song {
    constructor(top, left, angle, id) {
        this.type = 'song';
        this.position = { top: top, left: left };
        this.angle = angle;
        this.height = 16;
        this.width = 16;
        this.velocity = 0;
        this.grace = 2;
        this.id = id;
    }
}

module.exports = { Player, Song };