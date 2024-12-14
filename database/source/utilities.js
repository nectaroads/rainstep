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

module.exports = { formatConsole };