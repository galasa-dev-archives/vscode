import * as vscode from 'vscode';

export class RemoteProvider  implements vscode.TextDocumentContentProvider {

    private schemeIdentifier:string;
    private content:string;

    constructor(schemeIdentifier: string, content:string) {
        this.schemeIdentifier = schemeIdentifier;
        this.content = content;
    }

    // emitter and its event
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.content;
    }
}