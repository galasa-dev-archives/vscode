import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LocalRun } from './TreeViewLocalResultArchiveStore';

export class ArtifactProvider implements vscode.TreeDataProvider<ArtifactItem | ArtifactDirectory> {
    private _onDidChangeTreeData: vscode.EventEmitter<ArtifactItem | ArtifactDirectory | undefined> = new vscode.EventEmitter<ArtifactItem | ArtifactDirectory | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ArtifactItem | ArtifactDirectory | undefined> = this._onDidChangeTreeData.event;

    constructor() { }

    private run : LocalRun | undefined = undefined;

    getTreeItem(element: ArtifactItem | ArtifactDirectory): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ArtifactItem | ArtifactDirectory): (ArtifactItem | ArtifactDirectory)[] | undefined {
        if(!element) {
            let artifacts: (ArtifactItem | ArtifactDirectory)[] = [];
            if(!this.run) {
                return undefined
            } else {
                artifacts.push(new ArtifactDirectory(this.run.label, "", vscode.TreeItemCollapsibleState.Expanded, "directory"));
                return artifacts;
            }
        } else if (element.path == "" && this.run) {
            return this.getArtifacts(path.join(this.run.path, "artifacts"));
        } else if(fs.statSync(element.path).isDirectory()) {
            return this.getArtifacts(element.path);
        } else {
            return undefined;
        }
    }

    private getArtifacts(docPath : string) : (ArtifactItem | ArtifactDirectory)[] {
        let items : (ArtifactItem | ArtifactDirectory)[] = [];
        fs.readdirSync(docPath).forEach(file => {
            if(this.run) {
                const filePath = path.join(docPath, file);
                if(fs.statSync(filePath).isDirectory()) {
                    items.push(new ArtifactDirectory(file, filePath, vscode.TreeItemCollapsibleState.Collapsed, "directory"));
                } else {
                    items.push(new ArtifactItem(file, filePath, vscode.TreeItemCollapsibleState.None, "file"));
                }
            }
        });
        return items;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
        const children = this.getChildren(undefined)
        if(children) {
            children.forEach(artifact => {
                this._onDidChangeTreeData.fire(artifact);
            });
        }
            
    }

    public setRun(run : LocalRun) {
        this.run = run;
        this.refresh();
    }
}

export class ArtifactItem extends vscode.TreeItem{
   
    constructor(public label: string,
                public path: string,
                public readonly collapsibleState: vscode.TreeItemCollapsibleState,
                public contextValue : string) {
        super(label, collapsibleState)

        this.command = getCommand(this);

        function getCommand(klass : any): vscode.Command | undefined {
            return {
                title: "Open file",
                command: "galasa-artifacts.open",
                arguments: [klass]
            }
        }
    }
}

export class ArtifactDirectory extends vscode.TreeItem{
   
    constructor(public label: string,
                public path: string,
                public readonly collapsibleState: vscode.TreeItemCollapsibleState,
                public contextValue : string) {
        super(label, collapsibleState)
    }
}

