import * as express from 'express';
import * as http from 'http';
import * as mqtt from 'mqtt';
import * as WebSocket from 'ws';

const ovenHost = 'mqtt://ughynpsq:9c8iIhKYKG2A@tailor.cloudmqtt.com:14322';
const ovenPort = '14332';
const usernames = new Map();

const app = express();

// Initialize http server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function addUser(ws: WebSocket, username: string) {
    usernames.set(ws, username);
}

function broadcastMessage(ws: WebSocket, message: string) {
    wss.clients.forEach((wsClient: WebSocket) => {
        if (wsClient !== ws && wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(usernames.get(ws) + ': ' +  message);
        }
    });
}

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    console.log(`Client connected with address ${req.socket.remoteAddress}`);
    ws.on('message', (message) => {
        var jsonMessage = JSON.parse(message.toString());
        if (jsonMessage['type'] === 'username') {
            addUser(ws, jsonMessage['data']);
        } else if (jsonMessage['type'] === 'message') {
            broadcastMessage(ws, jsonMessage['data']);
        }
    });
});

server.listen(5000, () => {
    console.log(`Server started on port 5000`);
    const mqttClient = mqtt.connect(ovenHost + ':' + ovenPort);

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
