import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class EnvironmentProvider implements vscode.TreeDataProvider<Property> {
    private _onDidChangeTreeData: vscode.EventEmitter<Property | undefined> = new vscode.EventEmitter<Property | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Property | undefined> = this._onDidChangeTreeData.event;

    constructor(galasaPath: string) { 
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

    getTreeItem(element: Property): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Property): Property[] | undefined {
        if(!element && this.envPath) {
            return this.getEnvName(this.envPath);
        } else if (element && element.key == "" && this.envPath) {
            return this.getProperties(this.envPath);
        } else {
            return undefined;
        }
    }

    private getEnvName(envPath : string) {
        let items : Property[] = [];
        if(fs.existsSync(envPath) && fs.statSync(envPath).isFile()) {
            const name = fs.readFileSync(envPath).toString().split(/\r?\n/)[0].substring(1).trim();
            items.push(new Property(name, "", "", "", vscode.TreeItemCollapsibleState.Expanded));
        }
        return items;
    }

    private getProperties(envPath : string) : Property[] {
        let items : Property[] = [];
        if(fs.existsSync(envPath) && fs.statSync(envPath).isFile()) {
            fs.readFileSync(envPath).toString().split(/\r?\n/).forEach(line => {
                if(!line.startsWith("#") && line != "") {
                    const pairing = line.split("=");
                    items.push(new Property(pairing[0] + " - " + pairing[1],pairing[0],pairing[1], "property", vscode.TreeItemCollapsibleState.None))
                }
            });
        }
        items.sort(function (a, b) {
            return a.key.toLowerCase().localeCompare(b.key.toLowerCase());
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

export class Property extends vscode.TreeItem{
   
    constructor(public label: string,
                public key: string,
                public value: string,
                public contextValue: string,
                public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState )
    }
}