import * as vscode from 'vscode';

export class CodeProvider implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = /(@Test)/g;
    }

    public provideCodeLenses(document: vscode.TextDocument):  vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        
        this.codeLenses = [];
        const regex = new RegExp(this.regex);
        const text = document.getText();
        if (text.indexOf("@Test") != -1 && text.indexOf("import dev.galasa.Test;") != -1 ) {
            let match;
            if (match = regex.exec(text)) {
                let line = document.lineAt(document.positionAt(match.index).line);
                let indexOf = line.text.indexOf(match[0]);
                let position = new vscode.Position(line.lineNumber, indexOf);
                let range = document.getWordRangeAtPosition(position, new RegExp(this.regex));

                if (range) {
                    this.codeLenses.push(new vscode.CodeLens(range))
                }
            }
        }
        return this.codeLenses;
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        codeLens.command = {
            title: "Debug Galasa Test",
            command: "galasa-test.debug"
        };
        return codeLens;
    }
    
}