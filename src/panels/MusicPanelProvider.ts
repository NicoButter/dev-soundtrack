import * as vscode from 'vscode';

export class MusicPanelProvider implements vscode.WebviewViewProvider {
    public static currentView: MusicPanelProvider | undefined;
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        MusicPanelProvider.currentView = this;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'media')
            ]
        };

        // Solo configurar el HTML si está vacío o es la primera vez
        // Esto evita que se recree el reproductor al cambiar de vista
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showInformationMessage(message.text);
                    return;
                case 'updateVolume': {
                    const config = vscode.workspace.getConfiguration('devSoundtrack');
                    if (message.type === 'music') {
                        config.update('musicVolume', message.value, vscode.ConfigurationTarget.Global);
                    } else if (message.type === 'effects') {
                        config.update('effectsVolume', message.value, vscode.ConfigurationTarget.Global);
                    }
                    return;
                }
                case 'updateMood':
                    vscode.workspace.getConfiguration('devSoundtrack')
                        .update('currentMood', message.mood, vscode.ConfigurationTarget.Global);
                    return;
                case 'playStateChanged':
                    vscode.commands.executeCommand('setContext', 'devSoundtrack.isPlaying', message.isPlaying);
                    return;
            }
        });
    }

    public static postMessage(message: object): void {
        if (MusicPanelProvider.currentView && MusicPanelProvider.currentView._view) {
            MusicPanelProvider.currentView._view.webview.postMessage(message);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        const musicVolume = config.get<number>('musicVolume', 50);
        const effectsVolume = config.get<number>('effectsVolume', 70);
        const currentMood = config.get<string>('currentMood', 'epic');

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; media-src https: http: data: blob:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dev Soundtrack</title>
    <style>
        :root {
            --container-padding: 12px;
            --button-padding: 8px 12px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
            padding: var(--container-padding);
            font-size: var(--vscode-font-size);
        }

        .section {
            margin-bottom: 16px;
            padding: 12px;
            background: var(--vscode-editor-background);
            border-radius: 4px;
        }

        .section-title {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
            opacity: 0.8;
            text-transform: uppercase;
        }

        /* Player Controls */
        .player-controls {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 12px;
        }

        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            padding: var(--button-padding);
            cursor: pointer;
            font-size: 16px;
        }

        button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .btn-play {
            padding: 10px 16px;
            font-size: 18px;
        }

        /* Track Info */
        .track-info {
            text-align: center;
            margin-bottom: 12px;
        }

        .track-name {
            font-weight: 600;
            margin-bottom: 2px;
        }

        .track-mood {
            font-size: 11px;
            opacity: 0.7;
        }

        /* Volume Slider */
        .volume-control {
            margin-bottom: 8px;
        }

        .volume-label {
            font-size: 11px;
            margin-bottom: 4px;
            display: block;
        }

        input[type="range"] {
            width: 100%;
            height: 4px;
            -webkit-appearance: none;
            background: var(--vscode-input-background);
            border-radius: 2px;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            background: var(--vscode-button-background);
            border-radius: 50%;
            cursor: pointer;
        }

        /* Mood Grid */
        .mood-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
        }

        .mood-btn {
            background: var(--vscode-input-background);
            border: 1px solid transparent;
            padding: 8px 4px;
            border-radius: 4px;
            cursor: pointer;
            text-align: center;
            font-size: 11px;
        }

        .mood-btn:hover {
            border-color: var(--vscode-focusBorder);
        }

        .mood-btn.active {
            border-color: var(--vscode-focusBorder);
            background: var(--vscode-list-activeSelectionBackground);
        }

        .mood-icon {
            font-size: 20px;
            margin-bottom: 2px;
        }

        /* Status */
        .status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px;
            background: var(--vscode-input-background);
            border-radius: 4px;
            font-size: 11px;
            margin-top: 12px;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--vscode-errorForeground);
        }

        .status-dot.playing {
            background: var(--vscode-testing-iconPassed);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body>
    <div class="track-info">
        <div class="track-name" id="trackName">Ready to Play</div>
        <div class="track-mood" id="trackMood">Select a mood</div>
    </div>

    <div class="player-controls">
        <button id="prevBtn" title="Previous">⏮</button>
        <button class="btn-play" id="playBtn" title="Play">▶</button>
        <button id="nextBtn" title="Next">⏭</button>
        <button id="muteBtn" title="Mute">🔊</button>
    </div>

    <div class="status">
        <span class="status-dot" id="statusDot"></span>
        <span id="statusText">Stopped</span>
    </div>

    <div class="section">
        <div class="section-title">🎚️ Volume</div>
        
        <div class="volume-control">
            <label class="volume-label" for="musicVolume">Music: <span id="musicVolumeValue">${musicVolume}%</span></label>
            <input type="range" id="musicVolume" min="0" max="100" value="${musicVolume}">
        </div>

        <div class="volume-control">
            <label class="volume-label" for="effectsVolume">Effects: <span id="effectsVolumeValue">${effectsVolume}%</span></label>
            <input type="range" id="effectsVolume" min="0" max="100" value="${effectsVolume}">
        </div>
    </div>

    <div class="section">
        <div class="section-title">🎭 Mood</div>
        <div class="mood-grid">
            <button class="mood-btn ${currentMood === 'epic' ? 'active' : ''}" data-mood="epic">
                <div class="mood-icon">⚔️</div>
                <div>Epic</div>
            </button>
            <button class="mood-btn ${currentMood === 'lofi' ? 'active' : ''}" data-mood="lofi">
                <div class="mood-icon">☕</div>
                <div>Lo-Fi</div>
            </button>
            <button class="mood-btn ${currentMood === 'synthwave' ? 'active' : ''}" data-mood="synthwave">
                <div class="mood-icon">🌆</div>
                <div>Synth</div>
            </button>
            <button class="mood-btn ${currentMood === '8bit' ? 'active' : ''}" data-mood="8bit">
                <div class="mood-icon">👾</div>
                <div>8-Bit</div>
            </button>
            <button class="mood-btn ${currentMood === 'ambient' ? 'active' : ''}" data-mood="ambient">
                <div class="mood-icon">🌿</div>
                <div>Ambient</div>
            </button>
            <button class="mood-btn ${currentMood === 'metal' ? 'active' : ''}" data-mood="metal">
                <div class="mood-icon">🤘</div>
                <div>Metal</div>
            </button>
        </div>
    </div>

    <script nonce="${nonce}">
        ${this._getMusicScript()}
    </script>
</body>
</html>`;
    }

    private _getMusicScript(): string {
        // Reutilizamos el mismo script de AudioPanel pero compacto para sidebar
        return `
        const vscode = acquireVsCodeApi();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Restaurar estado previo si existe
        const previousState = vscode.getState() || {};
        
        let isPlaying = previousState.isPlaying || false;
        let isMuted = previousState.isMuted || false;
        let currentMood = previousState.currentMood || document.querySelector('.mood-btn.active')?.dataset.mood || 'epic';
        let musicVolume = previousState.musicVolume || parseInt(document.getElementById('musicVolume').value) / 100;
        let effectsVolume = previousState.effectsVolume || parseInt(document.getElementById('effectsVolume').value) / 100;
        let currentTrackIndex = previousState.currentTrackIndex || 0;

        const moods = {
            epic: { baseFreq: 220, tempo: 120, scale: [0, 2, 3, 5, 7, 8, 10] },
            lofi: { baseFreq: 330, tempo: 80, scale: [0, 2, 4, 5, 7, 9, 11] },
            synthwave: { baseFreq: 440, tempo: 100, scale: [0, 2, 4, 6, 7, 9, 11] },
            '8bit': { baseFreq: 262, tempo: 140, scale: [0, 2, 4, 5, 7, 9, 11] },
            ambient: { baseFreq: 220, tempo: 60, scale: [0, 2, 4, 7, 9] },
            metal: { baseFreq: 110, tempo: 160, scale: [0, 1, 3, 5, 6, 8, 10] }
        };

        const trackNames = {
            epic: ['Heroes Rise', 'Battle Symphony', 'Victory March'],
            lofi: ['Coffee & Code', 'Rainy Afternoon', 'Chill Vibes'],
            synthwave: ['Neon Dreams', 'Night Drive', 'Retro Future'],
            '8bit': ['Level Up', 'Boss Fight', 'Game Over'],
            ambient: ['Forest Dawn', 'Ocean Waves', 'Mountain Air'],
            metal: ['Code Crusher', 'Debug Fury', 'Merge Conflict']
        };

        let nextNoteTime = 0;
        let animationFrameId = null;

        // Función para guardar el estado
        function saveState() {
            vscode.setState({
                isPlaying,
                isMuted,
                currentMood,
                musicVolume,
                effectsVolume,
                currentTrackIndex
            });
        }

        function getFrequency(mood, degree) {
            const moodConfig = moods[mood];
            const semitone = moodConfig.scale[degree % moodConfig.scale.length];
            const octave = Math.floor(degree / moodConfig.scale.length);
            return moodConfig.baseFreq * Math.pow(2, (semitone + octave * 12) / 12);
        }

        function playMusic() {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            
            nextNoteTime = audioContext.currentTime;
            
            function scheduleNotes() {
                if (!isPlaying) return;
                
                const moodConfig = moods[currentMood];
                const noteLength = 60 / moodConfig.tempo / 2;
                
                while (nextNoteTime < audioContext.currentTime + 0.2) {
                    const degree = Math.floor(Math.random() * moodConfig.scale.length * 2);
                    const freq = getFrequency(currentMood, degree);
                    
                    let waveType = 'sine';
                    if (currentMood === '8bit') waveType = 'square';
                    else if (currentMood === 'synthwave' || currentMood === 'metal') waveType = 'sawtooth';
                    else if (currentMood === 'epic') waveType = 'triangle';
                    
                    if (!isMuted) {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.value = freq;
                        osc.type = waveType;
                        gain.gain.value = 0.1 * musicVolume;
                        osc.start(nextNoteTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, nextNoteTime + noteLength);
                        osc.stop(nextNoteTime + noteLength);
                    }
                    
                    nextNoteTime += noteLength;
                }
                
                animationFrameId = requestAnimationFrame(scheduleNotes);
            }
            
            scheduleNotes();
        }

        function stopMusic() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }

        function updateUI() {
            document.getElementById('playBtn').textContent = isPlaying ? '⏸' : '▶';
            document.getElementById('statusDot').className = 'status-dot' + (isPlaying ? ' playing' : '');
            document.getElementById('statusText').textContent = isPlaying ? 'Playing' : 'Stopped';
            document.getElementById('muteBtn').textContent = isMuted ? '🔇' : '🔊';
            const tracks = trackNames[currentMood] || trackNames.epic;
            document.getElementById('trackName').textContent = tracks[currentTrackIndex % tracks.length];
            document.getElementById('trackMood').textContent = currentMood.charAt(0).toUpperCase() + currentMood.slice(1);
        }

        // Event listeners
        document.getElementById('playBtn').addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) playMusic();
            else stopMusic();
            updateUI();
            saveState();
            vscode.postMessage({ command: 'playStateChanged', isPlaying });
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            currentTrackIndex = Math.max(0, currentTrackIndex - 1);
            updateUI();
            saveState();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            currentTrackIndex++;
            updateUI();
            saveState();
        });

        document.getElementById('muteBtn').addEventListener('click', () => {
            isMuted = !isMuted;
            updateUI();
            saveState();
        });

        document.getElementById('musicVolume').addEventListener('input', (e) => {
            musicVolume = e.target.value / 100;
            document.getElementById('musicVolumeValue').textContent = e.target.value + '%';
            saveState();
            vscode.postMessage({ command: 'updateVolume', type: 'music', value: parseInt(e.target.value) });
        });

        document.getElementById('effectsVolume').addEventListener('input', (e) => {
            effectsVolume = e.target.value / 100;
            document.getElementById('effectsVolumeValue').textContent = e.target.value + '%';
            saveState();
            vscode.postMessage({ command: 'updateVolume', type: 'effects', value: parseInt(e.target.value) });
        });

        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMood = btn.dataset.mood;
                currentTrackIndex = 0;
                if (isPlaying) {
                    stopMusic();
                    playMusic();
                }
                updateUI();
                saveState();
                vscode.postMessage({ command: 'updateMood', mood: currentMood });
            });
        });

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'play':
                    if (!isPlaying) {
                        isPlaying = true;
                        playMusic();
                        updateUI();
                        saveState();
                    }
                    break;
                case 'pause':
                case 'stop':
                    isPlaying = false;
                    stopMusic();
                    updateUI();
                    saveState();
                    break;
                case 'toggleMute':
                    isMuted = !isMuted;
                    updateUI();
                    saveState();
                    break;
                case 'playEffect':
                    console.log('Playing effect:', message.effect);
                    // Effects handled here when needed
                    break;
            }
        });

        // Restaurar el estado de reproducción si estaba sonando
        if (isPlaying) {
            playMusic();
        }
        
        updateUI();
        `;
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
