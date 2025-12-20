import * as vscode from 'vscode';
import { MusicPanelProvider } from '../panels/MusicPanelProvider';

export class SoundEffectsManager {
    private context: vscode.ExtensionContext;
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
            console.log('🔇 Dev Soundtrack: Effects disabled');
            return;
        }

        console.log(`🔊 Dev Soundtrack: Playing effect "${effectName}"`);

        // Get volume from config
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        const volume = config.get<number>('effectsVolume', 70) / 100;

        // Send message to the sidebar panel
        console.log('🔊 Dev Soundtrack: Sending effect to MusicPanelProvider:', effectName);
        
        // Give the webview a moment to initialize if needed
        setTimeout(() => {
            MusicPanelProvider.postMessage({
                command: 'playEffect',
                effect: effectName,
                volume: volume
            });
            console.log('✅ Effect message sent');
        }, 100);
    }

    public dispose(): void {
        // No cleanup needed anymore since we're using MusicPanelProvider
    }
}

