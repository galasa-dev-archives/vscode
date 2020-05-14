import * as vscode from 'vscode';
import * as fs from 'fs';
import { DefaultApi } from "galasa-web-api";


export class RemoteRASProvider implements vscode.TreeDataProvider<Directory | TestArtifact> {
    private api:DefaultApi | undefined;

    private _onDidChangeTreeData: vscode.EventEmitter<Directory | TestArtifact | undefined> = new vscode.EventEmitter<Directory | TestArtifact | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Directory | TestArtifact | undefined> = this._onDidChangeTreeData.event;

    constructor(private url: string) {
        this.api = new DefaultApi(url);

        if (!this.api) {
            vscode.window.showErrorMessage("The connection with the api for your remote service has failed.");
        }
    }

    getTreeItem(element: Directory | TestArtifact): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): (Directory | TestArtifact)[] | undefined {
        let list:(Directory | TestArtifact)[] = [];
        console.log(this.api?.resultarchiveGet())
        list.push(new TestArtifact("test",vscode.TreeItemCollapsibleState.None, ""));
        return list;
    }

    private extractFileStructure(json: JSON): (Directory | TestArtifact)[] {
        let list:(Directory | TestArtifact)[] = [];

        if (json) {
            
        } else {
            vscode.window.showErrorMessage("We were not able to communicate with the remote Galasa Ecosystem to read the remote Result Archive Store.");
        }
        
        return [];
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

