import * as express from 'express';
import * as http from 'http';
import * as mqtt from 'mqtt';
import * as WebSocket from 'ws';

const app = express();

// Initialize http server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    console.log(`Client connected with address ${req.socket.remoteAddress}`);
});

server.listen(8080, () => {
    console.log(`Server started on port 8080`);
    const mqttClient = mqtt.connect(
        'mqtt://ughynpsq:9c8iIhKYKG2A@tailor.cloudmqtt.com:14332');

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        mqttClient.subscribe('ovenTemp');
    });

    mqttClient.on('message', (topic, message) => {
        console.log(`Message received: ${message.toString()}`);
        // Broadcast the temperature
        wss.clients.forEach((wsClient: WebSocket) => {
            if (wsClient.readyState === WebSocket.OPEN) {
                wsClient.send(message.toString());
            }
        });
    });
});
