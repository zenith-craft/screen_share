// Display (Smartboard) JavaScript - Zero-Latency Ultra-Fast Playback Engine
let ws = null;
let roomCode = null;
let peerConnection = null;
let currentMode = 'duplicate';

// Candidate queue to prevent InvalidStateError before remoteDescription is set
let candidateQueue = [];
let isRemoteDescriptionSet = false;

// STUN + Free OpenRelay TURN servers for global cross-network & CGNAT connectivity
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ],
    iceCandidatePoolSize: 10
};

// UI Elements
const waitingScreen = document.getElementById('waitingScreen');
const activeDisplay = document.getElementById('activeDisplay');
const displayCode = document.getElementById('displayCode');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const networkUrlText = document.getElementById('networkUrlText');
const qrCodeImg = document.getElementById('qrCodeImg');
const btnFullscreen = document.getElementById('btnFullscreen');

const viewStream = document.getElementById('viewStream');
const viewStandby = document.getElementById('viewStandby');
const streamWaitingBanner = document.getElementById('streamWaitingBanner');
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
        try {
            const msg = JSON.parse(event.data);
            handleServerMessage(msg);
        } catch (e) {
            console.error('WS message error:', e);
        }
    };

    ws.onclose = () => {
        statusText.innerText = '❌ Server bilan aloqa uzildi! Qayta yuklanmoqda...';
        statusDot.style.background = '#ef4444';
        setTimeout(() => location.reload(), 3000);
    };
}

initWebSocket();

function handleServerMessage(msg) {
    switch (msg.type) {
        case 'room_created':
            roomCode = msg.code;
            displayCode.innerText = roomCode;

            // Determine URL for phone/laptop connection (works both local and online)
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            let baseUrl;
            if (!isLocal && window.location.hostname) {
                baseUrl = `${window.location.protocol}//${window.location.host}`;
            } else {
                const hostIp = msg.networkIp || window.location.hostname;
                const hostPort = msg.port || window.location.port || '3000';
                baseUrl = `http://${hostIp}:${hostPort}`;
            }

            const connectUrl = `${baseUrl}/sender.html?code=${roomCode}`;
            
            if (networkUrlText) {
                networkUrlText.innerText = baseUrl;
            }

            if (qrCodeImg) {
                qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(connectUrl)}`;
            }
            break;

        case 'sender_connected':
            statusText.innerText = typeof t === 'function' ? t('laptop_connected_msg') : '✅ Qurilma ulandi! Tasvir uzatishga tayyor.';
            statusDot.style.background = '#10b981';
            statusDot.style.boxShadow = '0 0 12px #10b981';

            waitingScreen.style.display = 'none';
            activeDisplay.style.display = 'flex';
            renderModeView(currentMode);

            if (streamWaitingBanner) {
                streamWaitingBanner.style.display = 'block';
            }

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
            alert('⚠️ Uzatuvchi qurilma aloqani uzdi.');
            location.reload();
            break;
    }
}

// Render active display view based on 3 modes (duplicate, extend, standby)
function renderModeView(mode) {
    if (mode === 'standby') {
        viewStream.style.display = 'none';
        viewStandby.style.display = 'flex';
    } else {
        viewStandby.style.display = 'none';
        viewStream.style.display = 'flex';
    }
}

// WebRTC Peer Connection (Low-Latency Receiver Engine)
function initPeerConnection() {
    if (peerConnection) {
        try { peerConnection.close(); } catch (e) {}
    }

    candidateQueue = [];
    isRemoteDescriptionSet = false;

    peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.ontrack = (event) => {
        let stream = null;
        if (event.streams && event.streams[0]) {
            stream = event.streams[0];
        } else if (event.track) {
            stream = new MediaStream([event.track]);
        }

        if (stream) {
            remoteVideo.srcObject = stream;
            remoteVideo.muted = true;
            remoteVideo.setAttribute('playsinline', '');
            remoteVideo.setAttribute('webkit-playsinline', '');

            if ('playoutDelayHint' in remoteVideo) {
                remoteVideo.playoutDelayHint = 0;
            }

            if (streamWaitingBanner) {
                streamWaitingBanner.style.display = 'none';
            }

            const playPromise = remoteVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log('Autoplay blocked, adding interaction trigger:', e);
                    document.body.addEventListener('click', () => remoteVideo.play(), { once: true });
                    document.body.addEventListener('touchstart', () => remoteVideo.play(), { once: true });
                });
            }
        }
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'signal',
                data: { candidate: event.candidate }
            }));
        }
    };

    peerConnection.onconnectionstatechange = () => {
        console.log('[Display WebRTC State]', peerConnection.connectionState);
    };
}

// Video event to hide waiting banner when frames start playing
remoteVideo.addEventListener('playing', () => {
    if (streamWaitingBanner) {
        streamWaitingBanner.style.display = 'none';
    }
});

async function handleSignal(data) {
    if (!peerConnection || peerConnection.connectionState === 'closed') {
        initPeerConnection();
    }

    try {
        if (data.sdp) {
            const desc = new RTCSessionDescription(data.sdp);
            await peerConnection.setRemoteDescription(desc);
            isRemoteDescriptionSet = true;

            // Flush any queued ICE candidates received before SDP
            while (candidateQueue.length > 0) {
                const candidate = candidateQueue.shift();
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.warn('Queued candidate error:', e);
                }
            }

            if (desc.type === 'offer') {
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'signal',
                        data: { sdp: peerConnection.localDescription }
                    }));
                }
            }
        } else if (data.candidate) {
            if (isRemoteDescriptionSet && peerConnection.remoteDescription) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                    console.warn('addIceCandidate error:', err);
                }
            } else {
                candidateQueue.push(data.candidate);
            }
        }
    } catch (err) {
        console.error('Error handling signal in display:', err);
    }
}

// Fullscreen button
if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            btnFullscreen.innerText = 'Chiqish';
        } else {
            document.exitFullscreen().catch(() => {});
            btnFullscreen.innerText = '⛶ To\'liq ekran';
        }
    });
}
