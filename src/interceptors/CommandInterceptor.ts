import * as vscode from 'vscode';
import { SoundEffectsManager } from '../audio/SoundEffectsManager';

export class CommandInterceptor {
    private context: vscode.ExtensionContext;
    private soundEffects: SoundEffectsManager;
    private disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext, soundEffects: SoundEffectsManager) {
        this.context = context;
        this.soundEffects = soundEffects;
    }

    public initialize(): void {
        // Listen for document save events
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument((document) => {
                this.onFileSaved(document);
            })
        );

        // Listen for document open events
        this.disposables.push(
            vscode.workspace.onDidOpenTextDocument((document) => {
                this.onFileOpened(document);
            })
        );

        // Listen for active editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor((editor) => {
                if (editor) {
                    this.onEditorChanged(editor);
                }
            })
        );

        // Listen for diagnostics changes (errors/warnings)
        this.disposables.push(
            vscode.languages.onDidChangeDiagnostics((event) => {
                this.onDiagnosticsChanged(event);
            })
        );

        // Listen for task completion (build success/failure)
        this.disposables.push(
            vscode.tasks.onDidEndTaskProcess((event) => {
                this.onTaskEnded(event);
            })
        );

        // Intercept undo command by wrapping it
        this.interceptUndoCommand();

        // Listen for source control changes (git commit detection)
        this.listenForGitCommits();

        // Add all disposables to context
        this.context.subscriptions.push(...this.disposables);
    }

    private onFileSaved(document: vscode.TextDocument): void {
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        if (config.get<boolean>('soundEffects.onSave', true)) {
            // Play epic save sound!
            this.soundEffects.playEffect('save');
        }
    }

    private onFileOpened(document: vscode.TextDocument): void {
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        if (config.get<boolean>('soundEffects.onFileOpen', false)) {
            this.soundEffects.playEffect('open');
        }
    }

    private onEditorChanged(editor: vscode.TextEditor): void {
        // Could add sounds for editor changes if desired
    }

    private onDiagnosticsChanged(event: vscode.DiagnosticChangeEvent): void {
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        // Check for new errors
        for (const uri of event.uris) {
            const diagnostics = vscode.languages.getDiagnostics(uri);
            const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
            
            if (errors.length > 0 && config.get<boolean>('soundEffects.onBuildError', true)) {
                // Don't spam - debounce this
                this.debouncedErrorSound();
            }
        }
    }

    private errorSoundTimeout: NodeJS.Timeout | undefined;
    private debouncedErrorSound(): void {
        if (this.errorSoundTimeout) {
            clearTimeout(this.errorSoundTimeout);
        }
        this.errorSoundTimeout = setTimeout(() => {
            this.soundEffects.playEffect('error');
        }, 500);
    }

    private onTaskEnded(event: vscode.TaskProcessEndEvent): void {
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        const taskName = event.execution.task.name.toLowerCase();
        const isBuildTask = taskName.includes('build') || 
                          taskName.includes('compile') || 
                          taskName.includes('webpack') ||
                          taskName.includes('tsc');

        if (isBuildTask) {
            if (event.exitCode === 0 && config.get<boolean>('soundEffects.onBuildSuccess', true)) {
                // Success fanfare!
                this.soundEffects.playEffect('fanfare');
            } else if (event.exitCode !== 0 && config.get<boolean>('soundEffects.onBuildError', true)) {
                // Error sound
                this.soundEffects.playEffect('error');
            }
        }
    }

    private interceptUndoCommand(): void {
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        
        if (!config.get<boolean>('soundEffects.onUndo', false)) {
            return;
        }

        // We can't directly intercept built-in commands, but we can listen to text changes
        // and detect undo patterns. For now, users can trigger this manually or we
        // rely on text document change events.
        
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument((event) => {
                // This is called for all text changes including undo
                // We'd need more sophisticated logic to detect undo specifically
            })
        );
    }

    private listenForGitCommits(): void {
        const config = vscode.workspace.getConfiguration('devSoundtrack');
        
        if (!config.get<boolean>('soundEffects.onGitCommit', true)) {
            return;
        }

        // Listen for git extension API if available
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (gitExtension) {
            gitExtension.activate().then((git) => {
                if (git && git.getAPI) {
                    const api = git.getAPI(1);
                    if (api) {
                        // Listen for repository changes
                        api.repositories.forEach((repo: { state: { onDidChange: (arg0: () => void) => void; HEAD: { commit: string; }; }; }) => {
                            let lastCommit = repo.state.HEAD?.commit;
                            
                            repo.state.onDidChange(() => {
                                const currentCommit = repo.state.HEAD?.commit;
                                if (currentCommit && currentCommit !== lastCommit) {
                                    lastCommit = currentCommit;
                                    this.soundEffects.playEffect('commit');
                                }
                            });
                        });
                    }
                }
            }, () => {
                // Git extension not available, that's okay
            });
        }
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        if (this.errorSoundTimeout) {
            clearTimeout(this.errorSoundTimeout);
        }
    }
}
