const HOST = `192.168.0.121`;
const PORT = '8080';

let memory = {
    player: { username: '', color: 'blue' },
    connections: [],
    hazards: {
        challenger: '',
        spawned: [],
    },
}

let socket = null;

let keysPressed = {};
let playerElement = null;
let desktopElement = null;
let screenElement = null;
let currentScreen = 0;

document.addEventListener('DOMContentLoaded', function () {
    screenElement = document.getElementById('screen');
    loadScreen[currentScreen]();
});

document.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    delete keysPressed[e.key.toLowerCase()];
});

function movePlayer() {
    if (!(keysPressed['w'] || keysPressed['s'] || keysPressed['a'] || keysPressed['d'])) return;
    const json = { type: 'onMove', pressedKeys: keysPressed };
    socket.send(JSON.stringify(json));
}

function updatePlayerPosition(element, position) {
    if (!element || !position) return;
    element.style.left = `${position.left}px`;
    element.style.top = `${position.top}px`;
}

function renderContext() {
    const renderedPlayers = Array.from(desktopElement.querySelectorAll('.guest'));
    const connectedPlayerIds = memory.connections.map(player => player.id);

    renderedPlayers.forEach(otherPlayerElement => {
        const playerId = parseInt(otherPlayerElement.id.replace('guest-', ''), 10);
        if (!connectedPlayerIds.includes(playerId)) otherPlayerElement.remove();
    });

    memory.connections.forEach(player => {
        const playerId = player.id;
        let otherPlayerElement = desktopElement.querySelector(`#guest-${playerId}`);

        if (!otherPlayerElement) {
            const html = `<img id="guest-${playerId}" class="guest" src="assets/images/player_${player.color}.png" alt="guest-${playerId}">`;
            desktopElement.insertAdjacentHTML("beforeend", html);
            otherPlayerElement = desktopElement.querySelector(`#guest-${playerId}`);
        }

        if (otherPlayerElement) updatePlayerPosition(otherPlayerElement, player.position);
    });

    updatePlayerPosition(playerElement, memory.player.position);
}

function startEngine() {
    setInterval(() => {
        if (currentScreen !== 3) return;
        movePlayer();
        renderContext();
    }, 16);
}

const loadScreen = [
    function index_0() {
        screenElement.innerHTML = screenHTML[0];
        desktopElement = document.getElementById('desktop');
        const doneButton = document.getElementById('done-button');
        doneButton.onclick = () => memory.player.username.length > 2 ? loadScreen[1]() : null;
        waveElement(desktopElement.id, .3, 10);
        const input = document.getElementById('username-input');
        input.addEventListener('input', () => {
            //const sfx = new Audio(`assets/sounds/type_${rollDice(2)}.wav`);
            //sfx.play();
            memory.player.username = input.value;
            if (memory.player.username.length < 3) input.classList.add('disabled');
            else input.classList.remove('disabled');
            shake(desktopElement.id, 30, 5);
        });
        currentScreen = 0;
    },

    function index_1() {
        screenElement.innerHTML = screenHTML[1];
        desktopElement = document.getElementById('desktop');
        const noButton = document.getElementById('no-button');
        noButton.onclick = () => loadScreen[0]();
        const yesButton = document.getElementById('yes-button');
        yesButton.onclick = () => loadScreen[2]();
        const name = document.getElementById('username');
        name.innerHTML = memory.player.username;
        waveElement(desktopElement.id, .3, 10);
        currentScreen = 1;
    },

    function index_2() {
        screenElement.innerHTML = screenHTML[2];
        desktopElement = document.getElementById('desktop');
        waveElement(desktopElement.id, .3, 10);
        currentScreen = 2;

        socket = new WebSocket(`ws://${HOST}:${PORT}`);

        socket.addEventListener('open', function () {
            socket.send(JSON.stringify({ type: 'onConnect', username: memory.player.username, color: memory.player.color }));
        });

        socket.addEventListener('message', function (event) {
            const data = JSON.parse(event.data);
            if (data.type == 'onUpdate') {
                if (currentScreen != 3) return;
                memory.player = data.player;
                memory.connections = data.connections;
                memory.hazards = data.hazards;
            } else if (data.type == 'onConnect') {
                loadScreen[3]();
            }
        });

        socket.addEventListener('close', function () {
            loadScreen[0]();
        });

        socket.addEventListener('error', function (error) {
            loadScreen[0]();
        });
    },

    function index_3() {
        screenElement.innerHTML = screenHTML[3];
        desktopElement = document.getElementById('desktop');
        playerElement = document.getElementById('player');
        waveElement(desktopElement.id, .2, 10);
        currentScreen = 3;
        startEngine();
    },
]

const screenHTML = [
    `<div id="desktop" class="desktop d-flex flex-column m-auto text-center">
     <h1 class='mb-1'>Name the Fallen Soul</h1>
     <input id="username-input" type="text" class="input disabled mb-1" placeholder="My name" autocomplete="off">
     <h1 id='done-button' class="button ms-auto pe-4">Done</h1>
     </div>`,

    `<div id="desktop" class="desktop d-flex flex-column m-auto text-center">
     <h1 class='mb-1'>Is this name correct?</h1>
     <h1 class='disabled mb-1' id="username"></h1>
     <div class="d-flex justify-content-center">
        <h1 id='no-button' class="button px-5">No</h1>
        <h1 id='yes-button' class="button px-5">Yes</h1>
     </div>
     </div>`,

    `<div id="desktop" class="desktop d-flex m-auto text-center align-items-center">
     <h1>Connecting</h1>
     </div>`,

    `<div id="desktop" class="desktop d-flex flex-column m-auto relative">
     <div class='square'></div>
     <img class='player' src="assets/images/player_${memory.player.color}.png" alt="player" id="player">
     </div>`
];

// Utilities Module
function rollDice(max) {
    const randomNumber = Math.floor(Math.random() * max + 1);
    return max > 1 ? randomNumber : 1;
}

// Animation Module
function waveElement(targetId, speed = 1, intensity = 5) {
    const element = document.getElementById(targetId);
    if (!element) return;
    let angle = 0;
    if (element.style.position === 'static' || !element.style.position) element.style.position = 'relative';
    (function animate() {
        angle += speed;
        const offsetX = Math.cos(angle * Math.PI / 180) * intensity;
        const offsetY = Math.sin(angle * Math.PI / 180) * intensity;
        element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        requestAnimationFrame(animate);
    })();
}

function shake(targetId, speed = 1, intensity = 10) {
    const element = document.getElementById(targetId);
    if (!element) return;
    let angle = 0;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const startX = 0;
    function animateShake() {
        angle += speed;
        const offsetX = Math.sin(angle * Math.PI / 180) * intensity * direction;
        if (angle >= 180) {
            element.style.transform = `translateX(${startX}px)`;
            return;
        }
        element.style.transform = `translateX(${offsetX}px)`;
        requestAnimationFrame(animateShake);
    }
    animateShake();
    requestAnimationFrame(animateShake);
}