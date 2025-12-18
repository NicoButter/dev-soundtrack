import * as vscode from 'vscode';
import { AudioPanel } from './panels/AudioPanel';
import { SoundEffectsManager } from './audio/SoundEffectsManager';
import { CommandInterceptor } from './interceptors/CommandInterceptor';

let soundEffectsManager: SoundEffectsManager;
let commandInterceptor: CommandInterceptor;

export function activate(context: vscode.ExtensionContext) {
    console.log('🎵 Dev Soundtrack is now active!');

    // Initialize managers
    soundEffectsManager = new SoundEffectsManager(context);
    commandInterceptor = new CommandInterceptor(context, soundEffectsManager);

    // Register commands
    const openPanelCommand = vscode.commands.registerCommand(
        'devSoundtrack.openPanel',
        () => {
            AudioPanel.createOrShow(context.extensionUri);
        }
    );

    const playCommand = vscode.commands.registerCommand(
        'devSoundtrack.play',
        () => {
            AudioPanel.postMessage({ command: 'play' });
            vscode.window.showInformationMessage('🎵 Dev Soundtrack: Playing music');
        }
    );

    const pauseCommand = vscode.commands.registerCommand(
        'devSoundtrack.pause',
        () => {
            AudioPanel.postMessage({ command: 'pause' });
            vscode.window.showInformationMessage('⏸️ Dev Soundtrack: Paused');
        }
    );

    const stopCommand = vscode.commands.registerCommand(
        'devSoundtrack.stop',
        () => {
            AudioPanel.postMessage({ command: 'stop' });
            vscode.window.showInformationMessage('⏹️ Dev Soundtrack: Stopped');
        }
    );

    const nextTrackCommand = vscode.commands.registerCommand(
        'devSoundtrack.nextTrack',
        () => {
            AudioPanel.postMessage({ command: 'nextTrack' });
        }
    );

    const previousTrackCommand = vscode.commands.registerCommand(
        'devSoundtrack.previousTrack',
        () => {
            AudioPanel.postMessage({ command: 'previousTrack' });
        }
    );

    const toggleMuteCommand = vscode.commands.registerCommand(
        'devSoundtrack.toggleMute',
        () => {
            AudioPanel.postMessage({ command: 'toggleMute' });
        }
    );

    const setMoodCommand = vscode.commands.registerCommand(
        'devSoundtrack.setMood',
        async () => {
            const moods = [
                { label: '⚔️ Epic', description: 'Heroic orchestral music', value: 'epic' },
                { label: '☕ Lo-Fi', description: 'Chill beats to code to', value: 'lofi' },
                { label: '🌆 Synthwave', description: 'Retro 80s vibes', value: 'synthwave' },
                { label: '👾 8-Bit', description: 'Classic chiptune sounds', value: '8bit' },
                { label: '🌿 Ambient', description: 'Calm and peaceful', value: 'ambient' },
                { label: '🤘 Metal', description: 'Intense coding sessions', value: 'metal' }
            ];

            const selected = await vscode.window.showQuickPick(moods, {
                placeHolder: 'Select a mood for your coding session'
            });

            if (selected) {
                const config = vscode.workspace.getConfiguration('devSoundtrack');
                await config.update('currentMood', selected.value, vscode.ConfigurationTarget.Global);
                AudioPanel.postMessage({ command: 'setMood', mood: selected.value });
                vscode.window.showInformationMessage(`🎵 Mood set to: ${selected.label}`);
            }
        }
    );

    const playSoundEffectCommand = vscode.commands.registerCommand(
        'devSoundtrack.playSoundEffect',
        async () => {
            const effects = [
                { label: '🥁 Drum Roll', value: 'drumroll' },
                { label: '🎺 Fanfare', value: 'fanfare' },
                { label: '⚡ Power Up', value: 'powerup' },
                { label: '🏆 Achievement', value: 'achievement' },
                { label: '💥 Explosion', value: 'explosion' },
                { label: '✨ Magic', value: 'magic' }
            ];

            const selected = await vscode.window.showQuickPick(effects, {
                placeHolder: 'Select a sound effect to play'
            });

            if (selected) {
                soundEffectsManager.playEffect(selected.value);
            }
        }
    );

    // Register all commands
    context.subscriptions.push(
        openPanelCommand,
        playCommand,
        pauseCommand,
        stopCommand,
        nextTrackCommand,
        previousTrackCommand,
        toggleMuteCommand,
        setMoodCommand,
        playSoundEffectCommand
    );

    // Initialize command interceptor for sound effects
    commandInterceptor.initialize();

    // Check if should play on startup
    const config = vscode.workspace.getConfiguration('devSoundtrack');
    if (config.get<boolean>('playOnStartup')) {
        // Delay to ensure everything is loaded
        setTimeout(() => {
            AudioPanel.createOrShow(context.extensionUri);
            AudioPanel.postMessage({ command: 'play' });
        }, 2000);
    }

    // Set context for conditional menus
    vscode.commands.executeCommand('setContext', 'devSoundtrack.isPlaying', false);
}

export function deactivate() {
    console.log('🎵 Dev Soundtrack deactivated');
    if (commandInterceptor) {
        commandInterceptor.dispose();
    }
}
