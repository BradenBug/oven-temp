const util = require('util');
const http = require('http');
import type { IncomingMessage } from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';
import { mqtt, iot } from 'aws-iot-device-sdk-v2';

const KEY = 'certs/oven.private.key';
const CERT = 'certs/oven.cert.pem';
const CA = 'certs/root-CA.crt';

const MQTT_CLIENT_ID = 'sdk-nodejs-server';
const OVEN_ENDPOINT = 'a1z4kclscqw25d-ats.iot.us-east-2.amazonaws.com';
const OVEN_PORT = '8883';
const TOPIC = 'ovenTemp';

const usernames = new Map();
const colors = new Map();

const app = express();

// Initialize http server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const decoder = new TextDecoder('utf8');

function constructMessage(type: string, data: string) {
    return `{"type": "${type}", "data": ${data}}`;
}

function addUser(ws: WebSocket, username: string) {
    if (!isValidUsername(ws, username)) {
        ws.send(constructMessage('userAck', 'false'));
    } else {
        usernames.set(ws, username);
        colors.set(ws, getRandomColor());
        ws.send(constructMessage('userAck', 'true')); 
        broadcastMessage(constructMessage('userList',
            `${JSON.stringify(getUsernameList())}`));
    }
}

function isValidUsername(ws: WebSocket, username: string) {
    const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    return (!format.test(username)
        && !getUsernameList().includes(username));
}

function getUsernameList() {
    return Array.from(usernames.values());
}

function broadcastMessage(message: string) {
    wss.clients.forEach((wsClient: WebSocket) => {
        if (wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(message);
        }
    });
}

function getRandomColor() {
    return `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
}

function broadcastChatMessage(ws: WebSocket, message: string) {
    const chatMessage = constructMessage('chat',
        `{"username": "${usernames.get(ws)}", `
        + `"color": "${colors.get(ws)}", `
        + `"message": "${message}"}`);
    broadcastMessage(chatMessage); 
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log(`Client connected with address ${req.socket.remoteAddress}`);
    if (usernames.has(ws)) {
        ws.send(constructMessage('userAck', 'true')); 
    }
    ws.on('message', (message) => {
        var jsonMessage = JSON.parse(message.toString());
        if (jsonMessage['type'] === 'username') {
            addUser(ws, jsonMessage['data']);
        } else if (jsonMessage['type'] === 'message') {
            if (usernames.has(ws)) {
                broadcastChatMessage(ws, jsonMessage['data']);
            }
        }
    });

    ws.on('close', () => {
        usernames.delete(ws);
        broadcastMessage(constructMessage(
            'userList', `${JSON.stringify(getUsernameList())}`));
    });
});

// --- MQTT Setup ---
let mqttConnection: mqtt.MqttClientConnection;

const on_publish = async (
    topic: string,
    payload: ArrayBuffer,
    dup: boolean,
    qos: mqtt.QoS,
    retain: boolean
) => {
    const json = decoder.decode(payload);
    console.log(`Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`);
    console.log(`Payload: ${json}`);
    try {
        const message = JSON.parse(json);
        broadcastMessage(constructMessage('temp', JSON.stringify(message)));
    } catch {
        console.warn('Could not parse MQTT message as JSON');
    }
};

async function execute_session() {
    let config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(CERT, KEY);
    config_builder.with_certificate_authority_from_path(undefined, CA);
    config_builder.with_clean_session(false);
    config_builder.with_client_id(MQTT_CLIENT_ID);
    config_builder.with_endpoint(OVEN_ENDPOINT);

    const config = config_builder.build();
    const client = new mqtt.MqttClient();
    const mqttConnection = client.new_connection(config);

    await mqttConnection.connect();
    console.log('✅ Connected to AWS IoT');

    await mqttConnection.subscribe(TOPIC, mqtt.QoS.AtLeastOnce, on_publish);
    console.log(`✅ Subscribed to topic "${TOPIC}"`);
}

// --- Start Server + MQTT ---
server.listen(5000, async () => {
    console.log('🚀 Server started on port 5000');
    try {
        await execute_session();
    } catch (err) {
        console.error('Failed to start MQTT session:', err);
    }
});

// --- Graceful Shutdown ---
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    if (mqttConnection) {
        await mqttConnection.disconnect();
        console.log('Disconnected from AWS IoT');
    }
    process.exit();
});
