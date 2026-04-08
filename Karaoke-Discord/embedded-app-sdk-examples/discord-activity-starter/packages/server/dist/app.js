"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
dotenv_1.default.config({ path: '../../.env' });
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const port = Number(process.env.PORT) || 3001;
app.use(express_1.default.json());
let playbackState = {
    isPlaying: false,
    time: 0,
    offsetSeconds: 0,
    song: 'miska'
};
function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
}
wss.on('connection', (ws) => {
    console.log('Client connected');
    // Отправляем текущее состояние новому клиенту
    ws.send(JSON.stringify({
        type: 'STATE',
        payload: playbackState
    }));
    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        const now = Date.now();
        if (data.type === 'PLAY') {
            // Если уже играет, игнорируем, чтобы не "прыгало" время
            if (playbackState.isPlaying)
                return;
            playbackState.time = now - (playbackState.offsetSeconds * 1000);
            playbackState.isPlaying = true;
            broadcast({ type: 'STATE', payload: playbackState });
        }
        if (data.type === 'PAUSE') {
            if (!playbackState.isPlaying)
                return;
            playbackState.offsetSeconds = (now - playbackState.time) / 1000;
            playbackState.isPlaying = false;
            broadcast({ type: 'STATE', payload: playbackState });
        }
        if (data.type === 'STOP') {
            playbackState.isPlaying = false;
            playbackState.time = 0;
            playbackState.offsetSeconds = 0;
            broadcast({ type: 'STATE', payload: playbackState });
        }
        // НОВОЕ: Обработка перемотки
        if (data.type === 'SEEK') {
            playbackState.offsetSeconds = data.time;
            // Если музыка играет, пересчитываем точку старта относительно нового времени
            if (playbackState.isPlaying) {
                playbackState.time = now - (data.time * 1000);
            }
            broadcast({ type: 'STATE', payload: playbackState });
        }
    });
});
server.listen(port, () => {
    console.log(`Server running on ${port}`);
});
