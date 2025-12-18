import * as vscode from 'vscode';

export class AudioPanel {
    public static currentPanel: AudioPanel | undefined;
    public static readonly viewType = 'devSoundtrack.audioPanel';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri): void {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (AudioPanel.currentPanel) {
            AudioPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            AudioPanel.viewType,
            '🎵 Dev Soundtrack',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true, // Keep audio playing when panel is hidden
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media')
                ]
            }
        );

        AudioPanel.currentPanel = new AudioPanel(panel, extensionUri);
    }

    public static postMessage(message: object): void {
        if (AudioPanel.currentPanel) {
            AudioPanel.currentPanel._panel.webview.postMessage(message);
        }
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            () => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showInformationMessage(message.text);
                        return;
                    case 'updateVolume':
                        const config = vscode.workspace.getConfiguration('devSoundtrack');
                        if (message.type === 'music') {
                            config.update('musicVolume', message.value, vscode.ConfigurationTarget.Global);
                        } else if (message.type === 'effects') {
                            config.update('effectsVolume', message.value, vscode.ConfigurationTarget.Global);
                        }
                        return;
                    case 'updateMood':
                        vscode.workspace.getConfiguration('devSoundtrack')
                            .update('currentMood', message.mood, vscode.ConfigurationTarget.Global);
                        return;
                    case 'playStateChanged':
                        vscode.commands.executeCommand('setContext', 'devSoundtrack.isPlaying', message.isPlaying);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public dispose(): void {
        AudioPanel.currentPanel = undefined;

        // Clean up resources
        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _update(): void {
        const webview = this._panel.webview;
        this._panel.title = '🎵 Dev Soundtrack';
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Get configuration
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        const musicVolume = config.get<number>('musicVolume', 50);
        const effectsVolume = config.get<number>('effectsVolume', 70);
        const currentMood = config.get<string>('currentMood', 'epic');

        // Use a nonce to only allow specific scripts to be run
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
            --bg-primary: #1e1e1e;
            --bg-secondary: #252526;
            --bg-tertiary: #2d2d30;
            --text-primary: #cccccc;
            --text-secondary: #858585;
            --accent: #007acc;
            --accent-hover: #1c97ea;
            --success: #4ec9b0;
            --warning: #dcdcaa;
            --error: #f14c4c;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #007acc, #4ec9b0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            color: var(--text-secondary);
            font-size: 14px;
        }

        .card {
            background: var(--bg-secondary);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid var(--bg-tertiary);
        }

        .card-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .card-title .icon {
            font-size: 20px;
        }

        /* Player Controls */
        .player-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .player-btn {
            background: var(--bg-tertiary);
            border: none;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-primary);
            font-size: 20px;
        }

        .player-btn:hover {
            background: var(--accent);
            transform: scale(1.05);
        }

        .player-btn.primary {
            width: 64px;
            height: 64px;
            background: var(--accent);
            font-size: 24px;
        }

        .player-btn.primary:hover {
            background: var(--accent-hover);
        }

        /* Track Info */
        .track-info {
            text-align: center;
            margin-bottom: 20px;
        }

        .track-name {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .track-mood {
            color: var(--text-secondary);
            font-size: 14px;
        }

        /* Progress Bar */
        .progress-container {
            margin-bottom: 20px;
        }

        .progress-bar {
            height: 4px;
            background: var(--bg-tertiary);
            border-radius: 2px;
            overflow: hidden;
            cursor: pointer;
        }

        .progress-fill {
            height: 100%;
            background: var(--accent);
            width: 0%;
            transition: width 0.1s linear;
        }

        .time-display {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 4px;
        }

        /* Volume Controls */
        .volume-control {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .volume-label {
            width: 100px;
            font-size: 14px;
        }

        .volume-slider {
            flex: 1;
            -webkit-appearance: none;
            appearance: none;
            height: 4px;
            background: var(--bg-tertiary);
            border-radius: 2px;
            outline: none;
        }

        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: var(--accent);
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.1s;
        }

        .volume-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
        }

        .volume-value {
            width: 40px;
            text-align: right;
            font-size: 14px;
            color: var(--text-secondary);
        }

        /* Mood Selector */
        .mood-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }

        .mood-btn {
            background: var(--bg-tertiary);
            border: 2px solid transparent;
            border-radius: 8px;
            padding: 12px 8px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            color: var(--text-primary);
        }

        .mood-btn:hover {
            border-color: var(--accent);
        }

        .mood-btn.active {
            border-color: var(--accent);
            background: rgba(0, 122, 204, 0.2);
        }

        .mood-icon {
            font-size: 24px;
            margin-bottom: 4px;
        }

        .mood-name {
            font-size: 12px;
            font-weight: 500;
        }

        /* Sound Effects */
        .effects-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }

        .effect-btn {
            background: var(--bg-tertiary);
            border: none;
            border-radius: 8px;
            padding: 16px 8px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            color: var(--text-primary);
        }

        .effect-btn:hover {
            background: var(--accent);
            transform: scale(1.02);
        }

        .effect-btn:active {
            transform: scale(0.98);
        }

        .effect-icon {
            font-size: 24px;
            margin-bottom: 4px;
        }

        .effect-name {
            font-size: 11px;
        }

        /* Status indicator */
        .status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 8px;
            background: var(--bg-tertiary);
            border-radius: 4px;
            font-size: 12px;
            color: var(--text-secondary);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--error);
        }

        .status-dot.playing {
            background: var(--success);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 20px;
            color: var(--text-secondary);
            font-size: 12px;
        }

        .footer a {
            color: var(--accent);
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 Dev Soundtrack</h1>
            <p>Your coding session deserves an epic soundtrack</p>
        </div>

        <!-- Player Card -->
        <div class="card">
            <div class="track-info">
                <div class="track-name" id="trackName">Ready to Play</div>
                <div class="track-mood" id="trackMood">Select a mood to begin</div>
            </div>

            <div class="player-controls">
                <button class="player-btn" id="prevBtn" title="Previous">⏮</button>
                <button class="player-btn primary" id="playBtn" title="Play">▶</button>
                <button class="player-btn" id="nextBtn" title="Next">⏭</button>
                <button class="player-btn" id="muteBtn" title="Mute">🔊</button>
            </div>

            <div class="progress-container">
                <div class="progress-bar" id="progressBar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="time-display">
                    <span id="currentTime">0:00</span>
                    <span id="totalTime">0:00</span>
                </div>
            </div>

            <div class="status">
                <span class="status-dot" id="statusDot"></span>
                <span id="statusText">Stopped</span>
            </div>
        </div>

        <!-- Volume Card -->
        <div class="card">
            <div class="card-title">
                <span class="icon">🎚️</span>
                Volume Controls
            </div>
            
            <div class="volume-control">
                <span class="volume-label">🎵 Music</span>
                <input type="range" class="volume-slider" id="musicVolume" min="0" max="100" value="${musicVolume}">
                <span class="volume-value" id="musicVolumeValue">${musicVolume}%</span>
            </div>

            <div class="volume-control">
                <span class="volume-label">🔊 Effects</span>
                <input type="range" class="volume-slider" id="effectsVolume" min="0" max="100" value="${effectsVolume}">
                <span class="volume-value" id="effectsVolumeValue">${effectsVolume}%</span>
            </div>
        </div>

        <!-- Mood Selector Card -->
        <div class="card">
            <div class="card-title">
                <span class="icon">🎭</span>
                Select Mood
            </div>
            
            <div class="mood-grid">
                <button class="mood-btn ${currentMood === 'epic' ? 'active' : ''}" data-mood="epic">
                    <div class="mood-icon">⚔️</div>
                    <div class="mood-name">Epic</div>
                </button>
                <button class="mood-btn ${currentMood === 'lofi' ? 'active' : ''}" data-mood="lofi">
                    <div class="mood-icon">☕</div>
                    <div class="mood-name">Lo-Fi</div>
                </button>
                <button class="mood-btn ${currentMood === 'synthwave' ? 'active' : ''}" data-mood="synthwave">
                    <div class="mood-icon">🌆</div>
                    <div class="mood-name">Synthwave</div>
                </button>
                <button class="mood-btn ${currentMood === '8bit' ? 'active' : ''}" data-mood="8bit">
                    <div class="mood-icon">👾</div>
                    <div class="mood-name">8-Bit</div>
                </button>
                <button class="mood-btn ${currentMood === 'ambient' ? 'active' : ''}" data-mood="ambient">
                    <div class="mood-icon">🌿</div>
                    <div class="mood-name">Ambient</div>
                </button>
                <button class="mood-btn ${currentMood === 'metal' ? 'active' : ''}" data-mood="metal">
                    <div class="mood-icon">🤘</div>
                    <div class="mood-name">Metal</div>
                </button>
            </div>
        </div>

        <!-- Sound Effects Card -->
        <div class="card">
            <div class="card-title">
                <span class="icon">🎯</span>
                Sound Effects
            </div>
            
            <div class="effects-grid">
                <button class="effect-btn" data-effect="drumroll">
                    <div class="effect-icon">🥁</div>
                    <div class="effect-name">Drum Roll</div>
                </button>
                <button class="effect-btn" data-effect="fanfare">
                    <div class="effect-icon">🎺</div>
                    <div class="effect-name">Fanfare</div>
                </button>
                <button class="effect-btn" data-effect="powerup">
                    <div class="effect-icon">⚡</div>
                    <div class="effect-name">Power Up</div>
                </button>
                <button class="effect-btn" data-effect="achievement">
                    <div class="effect-icon">🏆</div>
                    <div class="effect-name">Achievement</div>
                </button>
                <button class="effect-btn" data-effect="explosion">
                    <div class="effect-icon">💥</div>
                    <div class="effect-name">Explosion</div>
                </button>
                <button class="effect-btn" data-effect="magic">
                    <div class="effect-icon">✨</div>
                    <div class="effect-name">Magic</div>
                </button>
            </div>
        </div>

        <div class="footer">
            <p>Press <strong>Ctrl+S</strong> to hear an epic save sound!</p>
            <p>Made with ❤️ for developers</p>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        
        // Audio context for generated sounds
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // State
        let isPlaying = false;
        let isMuted = false;
        let currentMood = '${currentMood}';
        let musicVolume = ${musicVolume} / 100;
        let effectsVolume = ${effectsVolume} / 100;
        
        // Music generation based on mood
        const moods = {
            epic: { baseFreq: 220, tempo: 120, scale: [0, 2, 3, 5, 7, 8, 10] },
            lofi: { baseFreq: 330, tempo: 80, scale: [0, 2, 4, 5, 7, 9, 11] },
            synthwave: { baseFreq: 440, tempo: 100, scale: [0, 2, 4, 6, 7, 9, 11] },
            '8bit': { baseFreq: 262, tempo: 140, scale: [0, 2, 4, 5, 7, 9, 11] },
            ambient: { baseFreq: 220, tempo: 60, scale: [0, 2, 4, 7, 9] },
            metal: { baseFreq: 110, tempo: 160, scale: [0, 1, 3, 5, 6, 8, 10] }
        };

        let musicInterval = null;
        let currentNoteIndex = 0;

        // DOM Elements
        const playBtn = document.getElementById('playBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const muteBtn = document.getElementById('muteBtn');
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const trackName = document.getElementById('trackName');
        const trackMood = document.getElementById('trackMood');
        const progressFill = document.getElementById('progressFill');
        const currentTimeEl = document.getElementById('currentTime');
        const musicVolumeSlider = document.getElementById('musicVolume');
        const effectsVolumeSlider = document.getElementById('effectsVolume');
        const musicVolumeValue = document.getElementById('musicVolumeValue');
        const effectsVolumeValue = document.getElementById('effectsVolumeValue');
        const moodBtns = document.querySelectorAll('.mood-btn');
        const effectBtns = document.querySelectorAll('.effect-btn');

        // Track names per mood
        const trackNames = {
            epic: ['Heroes Rise', 'Battle Symphony', 'Victory March'],
            lofi: ['Coffee & Code', 'Rainy Afternoon', 'Chill Vibes'],
            synthwave: ['Neon Dreams', 'Night Drive', 'Retro Future'],
            '8bit': ['Level Up', 'Boss Fight', 'Game Over'],
            ambient: ['Forest Dawn', 'Ocean Waves', 'Mountain Air'],
            metal: ['Code Crusher', 'Debug Fury', 'Merge Conflict']
        };

        let currentTrackIndex = 0;
        let playTime = 0;

        // Play a note
        function playNote(frequency, duration, type = 'sine') {
            if (isMuted) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.value = 0.1 * musicVolume;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            oscillator.stop(audioContext.currentTime + duration);
        }

        // Get frequency from scale degree
        function getFrequency(mood, degree) {
            const moodConfig = moods[mood];
            const semitone = moodConfig.scale[degree % moodConfig.scale.length];
            const octave = Math.floor(degree / moodConfig.scale.length);
            return moodConfig.baseFreq * Math.pow(2, (semitone + octave * 12) / 12);
        }

        // Play generated music
        function playMusic() {
            if (musicInterval) {
                clearInterval(musicInterval);
            }

            const moodConfig = moods[currentMood];
            const noteLength = 60000 / moodConfig.tempo / 2;

            musicInterval = setInterval(() => {
                if (!isPlaying || isMuted) return;

                // Generate a simple melody
                const degree = Math.floor(Math.random() * moodConfig.scale.length * 2);
                const freq = getFrequency(currentMood, degree);
                
                // Choose waveform based on mood
                let waveType = 'sine';
                if (currentMood === '8bit') waveType = 'square';
                else if (currentMood === 'synthwave') waveType = 'sawtooth';
                else if (currentMood === 'metal') waveType = 'sawtooth';
                else if (currentMood === 'epic') waveType = 'triangle';

                playNote(freq, noteLength / 1000, waveType);
                
                // Update progress
                playTime += noteLength / 1000;
                updateProgress();
                
            }, noteLength);
        }

        function stopMusic() {
            if (musicInterval) {
                clearInterval(musicInterval);
                musicInterval = null;
            }
        }

        function updateProgress() {
            const progress = (playTime % 180) / 180 * 100; // 3 min tracks
            progressFill.style.width = progress + '%';
            
            const mins = Math.floor(playTime % 180 / 60);
            const secs = Math.floor(playTime % 60);
            currentTimeEl.textContent = mins + ':' + secs.toString().padStart(2, '0');
        }

        function updateUI() {
            playBtn.textContent = isPlaying ? '⏸' : '▶';
            statusDot.className = 'status-dot' + (isPlaying ? ' playing' : '');
            statusText.textContent = isPlaying ? 'Playing' : 'Stopped';
            muteBtn.textContent = isMuted ? '🔇' : '🔊';
            
            const tracks = trackNames[currentMood] || trackNames.epic;
            trackName.textContent = tracks[currentTrackIndex % tracks.length];
            trackMood.textContent = currentMood.charAt(0).toUpperCase() + currentMood.slice(1) + ' Mode';
        }

        // Sound effects
        const soundEffects = {
            drumroll: () => {
                const rollDuration = 1.5;
                const hits = 30;
                for (let i = 0; i < hits; i++) {
                    setTimeout(() => {
                        playEffectTone(100 + Math.random() * 50, 0.1, 'triangle', 0.2);
                    }, (i / hits) * rollDuration * 1000);
                }
                setTimeout(() => {
                    playEffectTone(80, 0.3, 'triangle', 0.5);
                }, rollDuration * 1000);
            },
            fanfare: () => {
                const notes = [523, 659, 784, 1047];
                notes.forEach((freq, i) => {
                    setTimeout(() => playEffectTone(freq, 0.3, 'square', 0.3), i * 150);
                });
            },
            powerup: () => {
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => playEffectTone(200 + i * 100, 0.1, 'square', 0.2), i * 50);
                }
            },
            achievement: () => {
                const melody = [784, 988, 1175, 1319, 1568];
                melody.forEach((freq, i) => {
                    setTimeout(() => playEffectTone(freq, 0.2, 'sine', 0.3), i * 100);
                });
            },
            explosion: () => {
                const noise = audioContext.createBufferSource();
                const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.5, audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                
                for (let i = 0; i < buffer.length; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (buffer.length * 0.1));
                }
                
                noise.buffer = buffer;
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 0.3 * effectsVolume;
                
                noise.connect(gainNode);
                gainNode.connect(audioContext.destination);
                noise.start();
            },
            magic: () => {
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => playEffectTone(800 + Math.random() * 800, 0.15, 'sine', 0.2), i * 80);
                }
            }
        };

        function playEffectTone(frequency, duration, type = 'sine', gain = 0.3) {
            if (isMuted) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.value = gain * effectsVolume;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            oscillator.stop(audioContext.currentTime + duration);
        }

        // Event Listeners
        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                playMusic();
            } else {
                stopMusic();
            }
            updateUI();
            vscode.postMessage({ command: 'playStateChanged', isPlaying });
        });

        prevBtn.addEventListener('click', () => {
            currentTrackIndex = Math.max(0, currentTrackIndex - 1);
            playTime = 0;
            updateUI();
        });

        nextBtn.addEventListener('click', () => {
            currentTrackIndex++;
            playTime = 0;
            updateUI();
        });

        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            updateUI();
        });

        musicVolumeSlider.addEventListener('input', (e) => {
            musicVolume = e.target.value / 100;
            musicVolumeValue.textContent = e.target.value + '%';
            vscode.postMessage({ command: 'updateVolume', type: 'music', value: parseInt(e.target.value) });
        });

        effectsVolumeSlider.addEventListener('input', (e) => {
            effectsVolume = e.target.value / 100;
            effectsVolumeValue.textContent = e.target.value + '%';
            vscode.postMessage({ command: 'updateVolume', type: 'effects', value: parseInt(e.target.value) });
        });

        moodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                moodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMood = btn.dataset.mood;
                currentTrackIndex = 0;
                playTime = 0;
                
                if (isPlaying) {
                    stopMusic();
                    playMusic();
                }
                
                updateUI();
                vscode.postMessage({ command: 'updateMood', mood: currentMood });
            });
        });

        effectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const effect = btn.dataset.effect;
                if (soundEffects[effect]) {
                    soundEffects[effect]();
                }
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
                    }
                    break;
                case 'pause':
                case 'stop':
                    isPlaying = false;
                    stopMusic();
                    if (message.command === 'stop') {
                        playTime = 0;
                    }
                    updateUI();
                    break;
                case 'nextTrack':
                    currentTrackIndex++;
                    playTime = 0;
                    updateUI();
                    break;
                case 'previousTrack':
                    currentTrackIndex = Math.max(0, currentTrackIndex - 1);
                    playTime = 0;
                    updateUI();
                    break;
                case 'toggleMute':
                    isMuted = !isMuted;
                    updateUI();
                    break;
                case 'setMood':
                    moodBtns.forEach(b => b.classList.remove('active'));
                    document.querySelector('[data-mood="' + message.mood + '"]')?.classList.add('active');
                    currentMood = message.mood;
                    if (isPlaying) {
                        stopMusic();
                        playMusic();
                    }
                    updateUI();
                    break;
            }
        });

        // Initialize
        updateUI();
    </script>
</body>
</html>`;
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
