import * as vscode from 'vscode';
import * as fs from 'fs';


export class RemoteRASProvider implements vscode.TreeDataProvider<Directory | TestArtifact> {
    private _onDidChangeTreeData: vscode.EventEmitter<Directory | TestArtifact | undefined> = new vscode.EventEmitter<Directory | TestArtifact | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Directory | TestArtifact | undefined> = this._onDidChangeTreeData.event;

    constructor(private galasaRoot: string | undefined) { }

    getTreeItem(element: Directory | TestArtifact): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): (Directory | TestArtifact)[] | undefined {
        return undefined; //TODO
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

}


export class Directory extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly path:string
    ) {
        super(label, collapsibleState);
    }

}

export class TestArtifact extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly path:string
    ) {
        super(label, collapsibleState);
    }

}

