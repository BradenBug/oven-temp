import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

// initialize http server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    console.log(req.socket.remoteAddress);
    wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('{"f": 100, "c": 30}');
        }
    });
});

server.listen(8080, () => {
    console.log(`Server started on port 8080`);
});
