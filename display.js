// Display (Smartboard) JavaScript - Zero-Latency Ultra-Fast Playback Engine
let ws = null;
let roomCode = null;
let peerConnection = null;
let currentMode = 'duplicate';

const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// UI Elements
const waitingScreen = document.getElementById('waitingScreen');
const activeDisplay = document.getElementById('activeDisplay');
const displayCode = document.getElementById('displayCode');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

const viewStream = document.getElementById('viewStream');
const viewStandby = document.getElementById('viewStandby');
const remoteVideo = document.getElementById('remoteVideo');

// Initialize WebSocket Connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
        console.log('[WS] Elektron doska serverga ulandi.');
        ws.send(JSON.stringify({ type: 'create_room' }));
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
    };

    ws.onclose = () => {
        statusText.innerText = '❌ Server bilan aloqa uzildi!';
        statusDot.style.background = '#ef4444';
    };
}

initWebSocket();

function handleServerMessage(msg) {
    switch (msg.type) {
        case 'room_created':
            roomCode = msg.code;
            displayCode.innerText = roomCode;
            break;

        case 'sender_connected':
            statusText.innerText = typeof t === 'function' ? t('laptop_connected_msg') : '✅ Noutbuk ulandi! Tasvir uzatishga tayyor.';
            statusDot.style.background = '#10b981';
            statusDot.style.boxShadow = '0 0 12px #10b981';

            waitingScreen.style.display = 'none';
            activeDisplay.style.display = 'flex';

            initPeerConnection();
            break;

        case 'signal':
            handleSignal(msg.data);
            break;

        case 'mode_changed':
            currentMode = msg.mode;
            renderModeView(msg.mode);
            break;

        case 'sender_disconnected':
            alert('⚠️ Uzatuvchi noutbuk aloqani uzdi.');
            location.reload();
            break;
    }
}

// Render active display view based on Windows 11 Project mode
function renderModeView(mode) {
    if (mode === 'standby' || mode === 'pc_only') {
        viewStream.style.display = 'none';
        viewStandby.style.display = 'flex';
    } else {
        viewStandby.style.display = 'none';
        viewStream.style.display = 'flex';
    }
}

// WebRTC Peer Connection (Low-Latency Receiver Engine)
function initPeerConnection() {
    peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
            remoteVideo.srcObject = event.streams[0];

            // Force Zero-Playout Delay for instant video frame rendering (No buffering lag)
            if ('playoutDelayHint' in remoteVideo) {
                remoteVideo.playoutDelayHint = 0;
            }

            if (event.receiver && 'playoutDelayHint' in event.receiver) {
                event.receiver.playoutDelayHint = 0;
            }

            // Low-latency video playback trigger
            remoteVideo.play().catch(e => console.log('Video play error:', e));
        }
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: 'signal',
                data: { candidate: event.candidate }
            }));
        }
    };
}

async function handleSignal(data) {
    if (data.sdp) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === 'offer') {
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            ws.send(JSON.stringify({
                type: 'signal',
                data: { sdp: peerConnection.localDescription }
            }));
        }
    } else if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}
