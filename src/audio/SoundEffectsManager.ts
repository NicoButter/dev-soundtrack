import * as vscode from 'vscode';

export class SoundEffectsManager {
    private context: vscode.ExtensionContext;
    private effectsPanel: vscode.WebviewPanel | undefined;
    private enabled: boolean = true;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadSettings();

        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('devSoundtrack')) {
                this.loadSettings();
            }
        });
    }

    private loadSettings(): void {
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        this.enabled = config.get<boolean>('enabled', true);
    }

    public playEffect(effectName: string): void {
        if (!this.enabled) {
            return;
        }

        // Create or reuse a hidden webview panel for playing effects
        if (!this.effectsPanel || !this.effectsPanel.visible === undefined) {
            this.createEffectsPanel();
        }

        const config = vscode.workspace.getConfiguration('devSoundtrack');
        const volume = config.get<number>('effectsVolume', 70) / 100;

        this.effectsPanel?.webview.postMessage({
            command: 'playEffect',
            effect: effectName,
            volume: volume
        });
    }

    private createEffectsPanel(): void {
        this.effectsPanel = vscode.window.createWebviewPanel(
            'devSoundtrackEffects',
            'Sound Effects',
            { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media')
                ]
            }
        );

        // Hide the panel immediately - we just need it for audio
        // Note: There's no direct way to hide, but we can minimize its impact

        this.effectsPanel.webview.html = this.getEffectsHtml();

        this.effectsPanel.onDidDispose(() => {
            this.effectsPanel = undefined;
        });
    }

    private getEffectsHtml(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sound Effects</title>
    <style>
        body {
            background: #1e1e1e;
            color: #cccccc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .status {
            text-align: center;
            opacity: 0.7;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="status">
        <div class="icon">🔊</div>
        <p>Sound Effects Engine Active</p>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // Sound effect URLs - using Web Audio API with generated sounds
        // In production, these would be actual audio files
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const effects = {
            drumroll: () => playDrumroll(),
            fanfare: () => playFanfare(),
            powerup: () => playPowerup(),
            achievement: () => playAchievement(),
            explosion: () => playExplosion(),
            magic: () => playMagic(),
            save: () => playSaveSound(),
            error: () => playErrorSound(),
            success: () => playSuccessSound(),
            undo: () => playUndoSound(),
            commit: () => playCommitSound(),
            open: () => playOpenSound()
        };

        let currentVolume = 0.7;

        // Play a simple tone
        function playTone(frequency, duration, type = 'sine', gain = 0.3) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.value = gain * currentVolume;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            oscillator.stop(audioContext.currentTime + duration);
        }

        // Drum roll effect
        function playDrumroll() {
            const rollDuration = 1.5;
            const hits = 30;
            for (let i = 0; i < hits; i++) {
                setTimeout(() => {
                    playTone(100 + Math.random() * 50, 0.1, 'triangle', 0.2);
                }, (i / hits) * rollDuration * 1000);
            }
            // Final hit
            setTimeout(() => {
                playTone(80, 0.3, 'triangle', 0.5);
            }, rollDuration * 1000);
        }

        // Fanfare effect
        function playFanfare() {
            const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                setTimeout(() => {
                    playTone(freq, 0.3, 'square', 0.3);
                }, i * 150);
            });
        }

        // Power up effect
        function playPowerup() {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    playTone(200 + i * 100, 0.1, 'square', 0.2);
                }, i * 50);
            }
        }

        // Achievement effect
        function playAchievement() {
            const melody = [784, 988, 1175, 1319, 1568]; // G5, B5, D6, E6, G6
            melody.forEach((freq, i) => {
                setTimeout(() => {
                    playTone(freq, 0.2, 'sine', 0.3);
                }, i * 100);
            });
        }

        // Explosion effect
        function playExplosion() {
            const noise = audioContext.createBufferSource();
            const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.5, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < buffer.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (buffer.length * 0.1));
            }
            
            noise.buffer = buffer;
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.3 * currentVolume;
            
            noise.connect(gainNode);
            gainNode.connect(audioContext.destination);
            noise.start();
        }

        // Magic effect
        function playMagic() {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    playTone(800 + Math.random() * 800, 0.15, 'sine', 0.2);
                }, i * 80);
            }
        }

        // Save sound (checkpoint)
        function playSaveSound() {
            playTone(880, 0.1, 'sine', 0.3);
            setTimeout(() => playTone(1108, 0.15, 'sine', 0.3), 100);
        }

        // Error sound
        function playErrorSound() {
            playTone(200, 0.15, 'sawtooth', 0.3);
            setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.3), 150);
        }

        // Success sound
        function playSuccessSound() {
            playTone(523, 0.1, 'sine', 0.3);
            setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100);
            setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200);
        }

        // Undo sound (rewind)
        function playUndoSound() {
            for (let i = 5; i >= 0; i--) {
                setTimeout(() => {
                    playTone(300 + i * 100, 0.08, 'square', 0.2);
                }, (5 - i) * 40);
            }
        }

        // Commit sound
        function playCommitSound() {
            playAchievement();
        }

        // File open sound
        function playOpenSound() {
            playTone(440, 0.1, 'sine', 0.2);
            setTimeout(() => playTone(550, 0.1, 'sine', 0.2), 80);
        }

        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'playEffect':
                    currentVolume = message.volume || 0.7;
                    if (effects[message.effect]) {
                        effects[message.effect]();
                    }
                    break;
            }
        });
    </script>
</body>
</html>`;
    }

    public dispose(): void {
        this.effectsPanel?.dispose();
    }
}
