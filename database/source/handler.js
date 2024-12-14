const fs = require('fs').promises;
let leaderboard = require('./leaderboard.json');
const { formatConsole } = require('./utilities');

const minutes = 5;

function startSaveRoutine() {
    setInterval(() => {
        try {
            fs.writeFileSync('./leaderboard.json', JSON.stringify(leaderboard, null, 4));
            console.log(formatConsole(`[Server] JSON saved succesfully: Leaderboard`));
        } catch (error) {
            console.log(formatConsole(`[Error] Failed to save JSON: Leaderboard`));
        }
    }, 1000 * 60 * minutes);
}

async function loadDatabase() {
    try {
        const filePath = './source/leaderboard.json';
        let data = await fs.readFile(filePath, 'utf8');
        if (!data.trim()) {
            console.log(formatConsole(`[Error] Empty JSON file: Resetting leaderboard`));
            leaderboard = [];
            await fs.writeFile(filePath, JSON.stringify(leaderboard, null, 4));
        } else {
            leaderboard = JSON.parse(data);
            if (!Array.isArray(leaderboard)) {
                console.log(formatConsole(`[Error] Invalid JSON structure: Resetting leaderboard`));
                leaderboard = [];
                await fs.writeFile(filePath, JSON.stringify(leaderboard, null, 4));
            }
        }
        console.log(formatConsole(`[Setup] JSON loaded successfully: Leaderboard`));
        startSaveRoutine();
    } catch (error) {
        console.error(formatConsole(`[Error] Failed to load JSON: ${error.message}`));
        leaderboard = [];
        try {
            await fs.writeFile('./leaderboard.json', JSON.stringify(leaderboard, null, 4));
            console.log(formatConsole(`[Setup] JSON file reset successfully: Leaderboard`));
        } catch (writeError) {
            console.error(formatConsole(`[Error] Failed to reset JSON file: ${writeError.message}`));
        }
    }
}

const commandHandler = {
    'push': (body, res) => {
        const { player } = body;
        if (!player?.username || !player.points || !player.connection) return;
        const existingPlayer = leaderboard.find(p => p.connection === player.connection);
        if (existingPlayer) existingPlayer.points = existingPlayer.points > player.points ? existingPlayer : player.points;
        else leaderboard.push(player);
        res.status(200).send({ success: true, message: formatConsole(`[Server] User saved: ${player.username}: ${player.connection}`) });
        console.log(formatConsole(`[Server] User saved: ${player.username}: ${player.connection}`));
    },

    'load': (body, res) => {
        try {
            leaderboard = JSON.parse(fs.readFileSync('./leaderboard.json', 'utf8'));
            console.log(formatConsole(`[Setup] JSON loaded succesfully: Leaderboard`));
        } catch (error) {
            console.log(formatConsole(`[Error] Failed to load JSON: Leaderboard`));
        }
    },

    'save': (body, res) => {
        try {
            fs.writeFileSync('./leaderboard.json', JSON.stringify(leaderboard, null, 4));
            res.status(200).send({ success: true, message: formatConsole(`[Server] JSON saved succesfully: Leaderboard`) });
            console.log(formatConsole(`[Server] JSON saved succesfully: Leaderboard`));
        } catch (error) {
            res.status(500).send({ success: true, message: formatConsole(`[Error] Failed to save JSON: Leaderboard`) });
            console.log(formatConsole(`[Error] Failed to save JSON: Leaderboard`));
        }
    },

    'leaderboard': (body, res) => {
        const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points).slice(0, 20);
        res.status(200).send({ success: true, message: JSON.stringify({ leaderboard: sortedLeaderboard }) });
    }
}

function handleRequest(body, res) {
    commandHandler[body.type](body, res);
}

module.exports = { handleRequest, loadDatabase };