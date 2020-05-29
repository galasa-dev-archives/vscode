import * as vscode from 'vscode';
import * as fs from 'fs';

export class EnvironmentProvider implements vscode.TreeDataProvider<Property> {
    private _onDidChangeTreeData: vscode.EventEmitter<Property | undefined> = new vscode.EventEmitter<Property | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Property | undefined> = this._onDidChangeTreeData.event;

    constructor(galasaPath: string) { 
        this.configPath = galasaPath +"/vscode/envconfig";
        if(!fs.existsSync(this.configPath)) {
            fs.writeFileSync(this.configPath, "");
            this.envPath = undefined;
        }
        const content = fs.readFileSync(this.configPath).toString().trim();
        if(content == "") {
            this.envPath = undefined;
        } else {
            this.envPath = content;
        }
    }

    private envPath : string | undefined;
    private configPath : string;

    getTreeItem(element: Property): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Property): Property[] | undefined {
        if(!element && this.envPath) {
            return this.getProperties(this.envPath);
        } else {
            return undefined;
        }
    }

    private getProperties(path : string) : Property[] {
        let items : Property[] = [];
        if(fs.existsSync(path) && fs.statSync(path).isFile()) {
            fs.readFileSync(path).toString().split(/\r?\n/).forEach(line => {
                if(!line.startsWith("#") && line != "") {
                    const pairing = line.split("=");
                    items.push(new Property(pairing[0] + " - " + pairing[1],pairing[0],pairing[1], vscode.TreeItemCollapsibleState.None))
                }
            });
        }
        return items;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
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

export class Property extends vscode.TreeItem{
   
    constructor(public label: string,
                public key: string,
                public value: string,
                public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState )
    }
}