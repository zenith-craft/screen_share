const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Room storage
// roomCode -> { displayWs, senderWs, mode, slideState }
const rooms = new Map();

// Generate random code (6 chars: uppercase, lowercase, numbers)
function generateRandomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Simple MIME types
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// HTTP Server
const server = http.createServer((req, res) => {
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end('Access denied');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Return index.html for unknown routes
                fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, indexContent) => {
                    if (err2) {
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(indexContent);
                    }
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// Lightweight WebSocket Server Handshake & Framing (RFC 6455)
server.on('upgrade', (req, socket, head) => {
    const key = req.headers['sec-websocket-key'];
    if (!key) {
        socket.destroy();
        return;
    }

    const acceptKey = crypto
        .createHash('sha1')
        .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
        .digest('base64');

    const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`
    ];

    socket.write(headers.join('\r\n') + '\r\n\r\n');

    setupWebSocketClient(socket);
});

function setupWebSocketClient(socket) {
    socket.isAlive = true;
    socket.roomCode = null;
    socket.role = null; // 'display' or 'sender'

    socket.on('data', (buffer) => {
        const frames = parseFrames(buffer);
        for (const frame of frames) {
            if (frame.opcode === 0x8) { // Connection Close
                handleDisconnect(socket);
                socket.end();
            } else if (frame.opcode === 0x9) { // Ping
                sendFrame(socket, frame.payload, 0xA); // Pong
            } else if (frame.opcode === 0x1 || frame.opcode === 0x2) { // Text or Binary frame
                try {
                    const messageStr = frame.payload.toString('utf8');
                    const message = JSON.parse(messageStr);
                    handleMessage(socket, message);
                } catch (e) {
                    console.error('Error handling WebSocket message:', e.message);
                }
            }
        }
    });

    socket.on('error', () => {
        handleDisconnect(socket);
    });

    socket.on('close', () => {
        handleDisconnect(socket);
    });
}

function handleMessage(socket, msg) {
    switch (msg.type) {
        case 'create_room': {
            // Generate unique random code
            let code = generateRandomCode();
            while (rooms.has(code)) {
                code = generateRandomCode();
            }
            socket.roomCode = code;
            socket.role = 'display';
            
            rooms.set(code, {
                displayWs: socket,
                senderWs: null,
                mode: 'duplicate',
                slideState: { currentSlide: 1, totalSlides: 1, pdfData: null }
            });

            sendJson(socket, {
                type: 'room_created',
                code: code
            });
            console.log(`[ROOM CREATED] Display opened room: ${code}`);
            break;
        }

        case 'join_room': {
            const code = msg.code ? msg.code.trim() : '';
            const room = rooms.get(code);

            if (!room) {
                sendJson(socket, {
                    type: 'error',
                    message: 'Kiritilgan parol noto‘g‘ri yoki seans topilmadi!'
                });
                return;
            }

            socket.roomCode = code;
            socket.role = 'sender';
            room.senderWs = socket;

            // Notify sender success
            sendJson(socket, {
                type: 'room_joined',
                code: code,
                currentMode: room.mode,
                slideState: room.slideState
            });

            // Notify display that sender joined
            if (room.displayWs) {
                sendJson(room.displayWs, {
                    type: 'sender_connected'
                });
            }
            console.log(`[ROOM JOINED] Sender connected to room: ${code}`);
            break;
        }

        case 'signal': {
            // Relay WebRTC signaling (offer, answer, ice-candidate)
            const room = rooms.get(socket.roomCode);
            if (!room) return;

            const targetWs = socket.role === 'sender' ? room.displayWs : room.senderWs;
            if (targetWs) {
                sendJson(targetWs, {
                    type: 'signal',
                    data: msg.data
                });
            }
            break;
        }

        case 'change_mode': {
            // Modes: 'duplicate', 'presentation', 'blank'
            const room = rooms.get(socket.roomCode);
            if (!room) return;

            room.mode = msg.mode;
            console.log(`[MODE CHANGE] Room ${socket.roomCode} -> ${msg.mode}`);

            if (room.displayWs) {
                sendJson(room.displayWs, {
                    type: 'mode_changed',
                    mode: msg.mode
                });
            }
            if (room.senderWs) {
                sendJson(room.senderWs, {
                    type: 'mode_changed',
                    mode: msg.mode
                });
            }
            break;
        }

        case 'slide_action': {
            const room = rooms.get(socket.roomCode);
            if (!room) return;

            // Relay slide events: start_beginning, next, prev, goto, pdf_upload
            if (msg.action === 'pdf_upload') {
                room.slideState.pdfData = msg.pdfData;
                room.slideState.totalSlides = msg.totalSlides;
                room.slideState.currentSlide = 1;
            } else if (msg.action === 'start_beginning') {
                room.slideState.currentSlide = 1;
            } else if (msg.action === 'next') {
                if (room.slideState.currentSlide < room.slideState.totalSlides) {
                    room.slideState.currentSlide++;
                }
            } else if (msg.action === 'prev') {
                if (room.slideState.currentSlide > 1) {
                    room.slideState.currentSlide--;
                }
            } else if (msg.action === 'goto') {
                room.slideState.currentSlide = msg.slideNumber;
            }

            // Broadcast to display
            if (room.displayWs) {
                sendJson(room.displayWs, {
                    type: 'slide_update',
                    action: msg.action,
                    slideState: room.slideState
                });
            }
            // Sync sender UI
            if (room.senderWs) {
                sendJson(room.senderWs, {
                    type: 'slide_update',
                    action: msg.action,
                    slideState: room.slideState
                });
            }
            break;
        }
    }
}

function handleDisconnect(socket) {
    if (!socket.roomCode) return;

    const room = rooms.get(socket.roomCode);
    if (!room) return;

    if (socket.role === 'display') {
        console.log(`[ROOM CLOSED] Display disconnected from room: ${socket.roomCode}`);
        if (room.senderWs) {
            sendJson(room.senderWs, {
                type: 'display_disconnected',
                message: 'Elektron doska aloqadan uzildi.'
            });
        }
        rooms.delete(socket.roomCode);
    } else if (socket.role === 'sender') {
        console.log(`[SENDER DISCONNECTED] Sender left room: ${socket.roomCode}`);
        room.senderWs = null;
        if (room.displayWs) {
            sendJson(room.displayWs, {
                type: 'sender_disconnected',
                message: 'Uzatuvchi qurilma ajraldi.'
            });
        }
    }
}

function sendJson(socket, obj) {
    sendFrame(socket, Buffer.from(JSON.stringify(obj), 'utf8'));
}

function sendFrame(socket, payload, opcode = 0x1) {
    if (socket.destroyed || !socket.writable) return;

    const length = payload.length;
    let header;

    if (length <= 125) {
        header = Buffer.alloc(2);
        header[0] = 0x80 | opcode;
        header[1] = length;
    } else if (length <= 65535) {
        header = Buffer.alloc(4);
        header[0] = 0x80 | opcode;
        header[1] = 126;
        header.writeUInt16BE(length, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = 0x80 | opcode;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(length), 2);
    }

    try {
        socket.write(Buffer.concat([header, payload]));
    } catch (e) {
        console.error('Frame send error:', e.message);
    }
}

function parseFrames(buffer) {
    const frames = [];
    let offset = 0;

    while (offset < buffer.length) {
        if (buffer.length - offset < 2) break;

        const byte1 = buffer[offset];
        const byte2 = buffer[offset + 1];

        const opcode = byte1 & 0x0f;
        const isMasked = (byte2 & 0x80) !== 0;
        let payloadLength = byte2 & 0x7f;

        let headerSize = 2;

        if (payloadLength === 126) {
            if (buffer.length - offset < 4) break;
            payloadLength = buffer.readUInt16BE(offset + 2);
            headerSize += 2;
        } else if (payloadLength === 127) {
            if (buffer.length - offset < 10) break;
            payloadLength = Number(buffer.readBigUInt64BE(offset + 2));
            headerSize += 8;
        }

        let maskingKey = null;
        if (isMasked) {
            if (buffer.length - offset < headerSize + 4) break;
            maskingKey = buffer.slice(offset + headerSize, offset + headerSize + 4);
            headerSize += 4;
        }

        if (buffer.length - offset < headerSize + payloadLength) break;

        let payload = buffer.slice(offset + headerSize, offset + headerSize + payloadLength);
        if (isMasked && maskingKey) {
            const unmasked = Buffer.alloc(payloadLength);
            for (let i = 0; i < payloadLength; i++) {
                unmasked[i] = payload[i] ^ maskingKey[i % 4];
            }
            payload = unmasked;
        }

        frames.push({ opcode, payload });
        offset += headerSize + payloadLength;
    }

    return frames;
}

server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` SmartBoard Connect server running on port ${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
