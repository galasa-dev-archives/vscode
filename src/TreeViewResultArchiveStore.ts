import * as vscode from 'vscode';
import * as fs from 'fs';
const rimraf = require("rimraf");

export class RASProvider implements vscode.TreeDataProvider<Directory | TestArtifact> {
    private _onDidChangeTreeData: vscode.EventEmitter<Directory | TestArtifact | undefined> = new vscode.EventEmitter<Directory | TestArtifact | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Directory | TestArtifact | undefined> = this._onDidChangeTreeData.event;

    constructor(private galasaRoot: string | undefined) { }

    getTreeItem(element: Directory | TestArtifact): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): (Directory | TestArtifact)[] | undefined {
        if (this.galasaRoot === "" || !this.galasaRoot) {
            vscode.window.showErrorMessage("You need to update your galasa path in your configurations of the Galasa extension.");
            return undefined;
        }
        if (!element) {
            return this.getDirectories(this.galasaRoot + "/ras").sort((run1, run2) => {
                if(run1 instanceof TestArtifact || run1 instanceof Directory) {
                    if(run2 instanceof TestArtifact || run2 instanceof Directory) {
                        if(fs.statSync(run1.path).mtime > fs.statSync(run2.path).mtime) {
                            return -1;
                        } else if (fs.statSync(run1.path).mtime = fs.statSync(run2.path).mtime) {
                            return 0;
                        }
                    }
                }
                return 1;
            });
        } else {
            if(element instanceof TestArtifact || element instanceof Directory) {
                return this.getDirectories(element.path);
            } else {
                return undefined;
            }
        }
    }

    private getDirectories(path: string): (Directory | TestArtifact)[] {
        let list: (Directory | TestArtifact)[] = Array(0);
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(file => {
                if (fs.statSync(path  + "/" + file).isDirectory()) {
                    list.push(new Directory(file, this.toDate(fs.statSync(path  + "/" + file)), vscode.TreeItemCollapsibleState.Collapsed, path  + "/" + file));
                } else {
                    list.push(new TestArtifact(file, "", vscode.TreeItemCollapsibleState.None, path  + "/" + file, "testartifact"));
                }
            });
            return list;
        } else {
            vscode.window.showErrorMessage("The Galasa extension was not able to find the correct directories.");
            return [];
        }
       
    }

    private toDate(date: fs.Stats): string {
        const mtime = date.mtime;
        return "Changes: " + mtime.getDate() + "/" + mtime.getMonth() + " - " + (mtime.getHours()) +  ":" + mtime.getMinutes() + ":" + mtime.getSeconds();
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public clearAll(): void {
        fs.readdirSync(this.galasaRoot + "/ras").forEach((file) => {
            let filePath = this.galasaRoot + "/ras/" + file;
            if(fs.statSync(filePath).isDirectory()) {
                rimraf(filePath, () => {return file + "cleared out of the RAS";});
            } else {
                fs.unlinkSync(filePath);
            }
        });
    }
}


export class Directory extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private lastTimeChanged: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly path:string
    ) {
        super(label, collapsibleState);
    }

    get description(): string {
        return this.lastTimeChanged;
    }
}

export class TestArtifact extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private lastTimeChanged: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly path:string,
        public contextValue : string
    ) {
        super(label, collapsibleState);
    }

    get description(): string {
        return this.lastTimeChanged;
    }
}

