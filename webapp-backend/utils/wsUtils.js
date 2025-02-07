const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('Client socket connesso');

    ws.on('message', (message) => {
        console.log(`Messaggio ricevuto: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client socket disconnesso');
    });
});

const sendNotification = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

module.exports = { wss, sendNotification };