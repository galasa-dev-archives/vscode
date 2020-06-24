import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class EnvironmentProvider implements vscode.TreeDataProvider<GalasaEnvironment> {
    private _onDidChangeTreeData: vscode.EventEmitter<GalasaEnvironment | undefined> = new vscode.EventEmitter<GalasaEnvironment | undefined>();
    readonly onDidChangeTreeData: vscode.Event<GalasaEnvironment | undefined> = this._onDidChangeTreeData.event;

    constructor(galasaPath: string) {
        this.galasaPath = galasaPath;
        this.configPath = path.join(galasaPath, "vscode", "envconfig");
        if(!fs.existsSync(this.configPath)) {
            fs.writeFileSync(this.configPath, "");
            this.envPath = undefined;
        } else {
            const content = fs.readFileSync(this.configPath).toString().trim();
            if(content == "") {
                this.envPath = undefined;
            } else {
                this.envPath = content;
            }
        }
    }

    private envPath : string | undefined;
    private configPath : string;
    private galasaPath : string;

    getTreeItem(element: GalasaEnvironment): vscode.TreeItem {
        return element;
    }

    getChildren(element?: GalasaEnvironment): GalasaEnvironment[] | undefined {
        let items : GalasaEnvironment[] = [];
        fs.readdirSync(path.join(this.galasaPath, "vscode")).forEach(file => {
            if(file.endsWith(".galenv")) {
                const filePath = path.join(this.galasaPath, "vscode", file);
                const name = fs.readFileSync(filePath).toString().split(/\r?\n/)[0].substring(1).trim();
                if(this.envPath == filePath) {
                    items.push(new GalasaEnvironment(name + " - Active", filePath, vscode.TreeItemCollapsibleState.None));
                } else {
                    items.push(new GalasaEnvironment(name, filePath, vscode.TreeItemCollapsibleState.None));
                }
            }
        });
        items.sort((a,b) => {
            if(a.label.endsWith(" - Active")) {
                return Number.MIN_SAFE_INTEGER;
            } else if(b.label.endsWith(" - Active")) {
                return Number.MAX_SAFE_INTEGER;
            } else {
                return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
            }
        });
        return items;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    public setEnvironment(envPath : string | undefined) {
        this.envPath = envPath;
        fs.writeFileSync(this.configPath, envPath);
        this.refresh();
    }

    public getEnvironment() : string | undefined {
        return this.envPath;
    }
}

export class GalasaEnvironment extends vscode.TreeItem{
   
    constructor(public label: string,
                public envPath: string,
                public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState )

        this.command = getCommand(this);

        function getCommand(klass : any): vscode.Command | undefined {
            return {
                title: "Open Environment",
                command: "galasa-environment.open",
                arguments: [klass]
            }
        }
    }
}