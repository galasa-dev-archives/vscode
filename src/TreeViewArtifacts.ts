import * as vscode from 'vscode';
import * as fs from 'fs';
import { LocalRun } from './TreeViewLocalResultArchiveStore';


export class ArtifactProvider implements vscode.TreeDataProvider<ArtifactItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ArtifactItem | undefined> = new vscode.EventEmitter<ArtifactItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ArtifactItem | undefined> = this._onDidChangeTreeData.event;

    constructor() { }

    private run : LocalRun | undefined = undefined;

    getTreeItem(element: ArtifactItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ArtifactItem): ArtifactItem[] | undefined {
        if(!element) {
            if(!this.run) {
                return undefined
            } else {
                return this.getArtifacts(this.run.path + "/artifacts");
            }
        } else if(fs.statSync(element.path).isDirectory()) {
            return this.getArtifacts(element.path);
        } else {
            return undefined;
        }
    }

    private getArtifacts(path : string) : ArtifactItem[] {
        let items : ArtifactItem[] = [];
        fs.readdirSync(path).forEach(file => {
            if(this.run) {
                const filePath = path + "/" + file;
                if(fs.statSync(filePath).isDirectory()) {
                    items.push(new ArtifactItem(file, filePath, vscode.TreeItemCollapsibleState.Collapsed, "directory"));
                } else {
                    items.push(new ArtifactItem(file, filePath, vscode.TreeItemCollapsibleState.None, "file"));
                }
            }
        });
        return items;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
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
        super(label, collapsibleState )
    }
}

