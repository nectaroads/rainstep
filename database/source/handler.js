const commandHandler = {
    'push': (body, res) => {

    },

    'load': (body, res) => {

    },

    'save': (body, res) => {

    }
}

function handleRequest(body, res) {
    commandHandler[body.type](body, res);
}

module.exports = { handleRequest };