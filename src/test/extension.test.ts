import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('your-publisher.dev-soundtrack'));
    });

    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        
        assert.ok(commands.includes('devSoundtrack.openPanel'));
        assert.ok(commands.includes('devSoundtrack.play'));
        assert.ok(commands.includes('devSoundtrack.pause'));
        assert.ok(commands.includes('devSoundtrack.stop'));
        assert.ok(commands.includes('devSoundtrack.toggleMute'));
        assert.ok(commands.includes('devSoundtrack.setMood'));
    });

    test('Configuration should have defaults', () => {
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        
        assert.strictEqual(config.get('enabled'), true);
        assert.strictEqual(config.get('musicVolume'), 50);
        assert.strictEqual(config.get('effectsVolume'), 70);
        assert.strictEqual(config.get('currentMood'), 'epic');
    });
});
