// Sender (Noutbuk) JavaScript - Ultra Fast 60fps & Windows 11 Win+P Engine
let ws = null;
let roomCode = null;
let peerConnection = null;
let localStream = null;
let currentMode = 'duplicate';

const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// UI Elements
const joinCodeInput = document.getElementById('joinCode');
const btnJoin = document.getElementById('btnJoin');
const connectStatus = document.getElementById('connectStatus');
const connectionBox = document.getElementById('connectionBox');
const controlPanel = document.getElementById('controlPanel');
const activeRoomCode = document.getElementById('activeRoomCode');

const btnStartStream = document.getElementById('btnStartStream');
const btnStopStream = document.getElementById('btnStopStream');
const streamStatusIndicator = document.getElementById('streamStatusIndicator');

const optPcOnly = document.getElementById('optPcOnly');
const optDuplicate = document.getElementById('optDuplicate');
const optExtend = document.getElementById('optExtend');
const optSecondOnly = document.getElementById('optSecondOnly');
const extendSubPanel = document.getElementById('extendSubPanel');
const btnPickSlideWindow = document.getElementById('btnPickSlideWindow');

const winPToast = document.getElementById('winPToast');
const winPToastText = document.getElementById('winPToastText');

// Windows 11 Modes Mapping
const win11Items = [
    { el: optPcOnly, mode: 'pc_only', label: 'PC screen only' },
    { el: optDuplicate, mode: 'duplicate', label: 'Duplicate' },
    { el: optExtend, mode: 'extend', label: 'Extend' },
    { el: optSecondOnly, mode: 'second_only', label: 'Second screen only' }
];

// Initialize WebSocket Connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
        console.log('[WS] Uzatuvchi serverga ulandi.');
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
    };

    ws.onclose = () => {
        connectStatus.innerText = '❌ Server bilan aloqa uzildi. Qayta yuklanmoqda...';
        connectStatus.style.color = 'var(--danger)';
    };
}

initWebSocket();

// Handle Join
btnJoin.addEventListener('click', () => {
    const code = joinCodeInput.value.trim();
    if (!code || code.length < 6) {
        connectStatus.innerText = typeof t === 'function' ? t('err_invalid_code') : '⚠️ Iltimos, 6 xonali ulanish parolini to‘liq kiriting!';
        connectStatus.style.color = 'var(--warning)';
        return;
    }

    connectStatus.innerText = typeof t === 'function' ? t('status_connecting') : '⏳ Ulash kutilmoqda...';
    connectStatus.style.color = 'var(--text-muted)';

    ws.send(JSON.stringify({
        type: 'join_room',
        code: code
    }));
});

// Handle Server Messages
function handleServerMessage(msg) {
    switch (msg.type) {
        case 'room_joined':
            roomCode = msg.code;
            connectStatus.innerText = '✅ OK';
            connectionBox.style.display = 'none';
            controlPanel.style.display = 'block';
            activeRoomCode.innerText = `Code: ${roomCode}`;

            initPeerConnection();
            break;

        case 'error':
            connectStatus.innerText = `❌ ${msg.message}`;
            connectStatus.style.color = 'var(--danger)';
            break;

        case 'signal':
            handleSignal(msg.data);
            break;

        case 'mode_changed':
            setUiActiveMode(msg.mode);
            break;

        case 'display_disconnected':
            alert('⚠️ Elektron doska aloqadan uzildi.');
            location.reload();
            break;
    }
}

// Windows 11 Option Click Handlers
win11Items.forEach(({ el, mode }) => {
    if (el) {
        el.addEventListener('click', () => {
            switchWin11Mode(mode);
        });
    }
});

function switchWin11Mode(mode) {
    currentMode = mode;
    setUiActiveMode(mode);

    // Show quick toast notification
    const item = win11Items.find(i => i.mode === mode);
    showWinPToast(item ? item.label : mode);

    // Send mode change to server and smartboard
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'change_mode',
            mode: mode
        }));
    }
}

function setUiActiveMode(mode) {
    win11Items.forEach(({ el, mode: m }) => {
        if (el) {
            if (m === mode) el.classList.add('active');
            else el.classList.remove('active');
        }
    });

    if (extendSubPanel) {
        extendSubPanel.style.display = (mode === 'extend') ? 'block' : 'none';
    }
}

let toastTimeout = null;
function showWinPToast(text) {
    if (!winPToast) return;
    winPToastText.innerText = text;
    winPToast.style.display = 'block';
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        winPToast.style.display = 'none';
    }, 2000);
}

// Keyboard Win + P / Alt + P Shortcut Listener
const modeCycle = ['duplicate', 'extend', 'second_only', 'pc_only'];
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if ((e.key === 'p' || e.key === 'P') && (e.metaKey || e.altKey || e.ctrlKey)) {
        e.preventDefault();
        const currentIndex = modeCycle.indexOf(currentMode);
        const nextIndex = (currentIndex + 1) % modeCycle.length;
        switchWin11Mode(modeCycle[nextIndex]);
    }
});

// Extend mode: Pick Slide Window (PowerPoint, Canva, Google Slides)
if (btnPickSlideWindow) {
    btnPickSlideWindow.addEventListener('click', async () => {
        try {
            const slideStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "window",
                    selfBrowserSurface: "exclude",
                    cursor: "always",
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 },
                    frameRate: { ideal: 60, max: 60 }
                },
                audio: false
            });

            const newTrack = slideStream.getVideoTracks()[0];
            newTrack.contentHint = 'motion';

            // Replace track in existing WebRTC sender seamlessly
            if (peerConnection) {
                const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) {
                    await sender.replaceTrack(newTrack);
                }
            }

            if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
            }
            localStream = slideStream;

            newTrack.onended = () => {
                switchWin11Mode('duplicate');
            };

            showWinPToast('Extend: Slayd oynasi ulandi!');
        } catch (err) {
            console.log('Slayd oynasi tanlanmadi:', err);
        }
    });
}

// WebRTC Peer Connection Initialization
function initPeerConnection() {
    peerConnection = new RTCPeerConnection(rtcConfig);

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
    } else if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}

// Ultra-Fast H264 Hardware Acceleration SDP Optimizer
function prioritizeH264(sdp) {
    const lines = sdp.split('\r\n');
    let mLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=video')) {
            mLineIndex = i;
            break;
        }
    }
    if (mLineIndex === -1) return sdp;

    const h264Payloads = [];
    const otherPayloads = [];
    
    lines.forEach(line => {
        if (line.startsWith('a=rtpmap:')) {
            const parts = line.substring(9).split(' ');
            const pt = parts[0];
            const codec = parts[1];
            if (codec && codec.toLowerCase().startsWith('h264/')) {
                h264Payloads.push(pt);
            } else if (pt) {
                otherPayloads.push(pt);
            }
        }
    });

    if (h264Payloads.length === 0) return sdp;

    const mParts = lines[mLineIndex].split(' ');
    const prefix = mParts.slice(0, 3).join(' ');
    const newPayloads = [...h264Payloads, ...otherPayloads.filter(p => !h264Payloads.includes(p))];
    lines[mLineIndex] = `${prefix} ${newPayloads.join(' ')}`;

    return lines.join('\r\n');
}

// Single-Click START Stream Trigger (Ultra Fast 60 FPS, Low-Latency Hardware Accelerated)
btnStartStream.addEventListener('click', async () => {
    try {
        localStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                displaySurface: "monitor",
                selfBrowserSurface: "exclude",
                surfaceSwitching: "include",
                cursor: "always",
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                frameRate: { ideal: 60, max: 60 }
            },
            audio: false
        });

        const videoTrack = localStream.getVideoTracks()[0];
        if ('contentHint' in videoTrack) {
            videoTrack.contentHint = 'motion';
        }

        videoTrack.onended = () => {
            stopScreenSharing();
        };

        btnStartStream.style.display = 'none';
        btnStopStream.style.display = 'inline-flex';
        streamStatusIndicator.style.display = 'block';

        // Add track to peer connection
        const sender = peerConnection.addTrack(videoTrack, localStream);

        // Configure sender parameters for 60fps high bitrate
        if (sender && sender.getParameters) {
            try {
                const params = sender.getParameters();
                params.degradationPreference = 'maintain-framerate';
                if (!params.encodings || params.encodings.length === 0) {
                    params.encodings = [{}];
                }
                params.encodings[0].maxBitrate = 12000000; // 12 Mbps smooth streaming
                params.encodings[0].networkPriority = 'high';
                await sender.setParameters(params);
            } catch (e) {
                console.log('Sender parameter error:', e);
            }
        }

        // Create SDP Offer with H.264 prioritization for hardware encoding
        const offer = await peerConnection.createOffer();
        const optimizedSdp = prioritizeH264(offer.sdp);
        
        const optimizedOffer = new RTCSessionDescription({
            type: offer.type,
            sdp: optimizedSdp
        });

        await peerConnection.setLocalDescription(optimizedOffer);

        ws.send(JSON.stringify({
            type: 'signal',
            data: { sdp: peerConnection.localDescription }
        }));

    } catch (err) {
        console.error('Stream boshlashda xatolik:', err);
    }
});

btnStopStream.addEventListener('click', () => {
    stopScreenSharing();
});

function stopScreenSharing() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    btnStartStream.style.display = 'inline-flex';
    btnStopStream.style.display = 'none';
    streamStatusIndicator.style.display = 'none';
}
