import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class RASProvider implements vscode.TreeDataProvider<LocalRun | Timing> {
    private _onDidChangeTreeData: vscode.EventEmitter<LocalRun | Timing | undefined> = new vscode.EventEmitter<LocalRun | Timing | undefined>();
    readonly onDidChangeTreeData: vscode.Event<LocalRun | Timing | undefined> = this._onDidChangeTreeData.event;

    constructor(private galasaRoot: string | undefined) { }

    getTreeItem(element: LocalRun | Timing): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): (LocalRun | Timing)[] | undefined {
        if (this.galasaRoot === "" || !this.galasaRoot) {
            vscode.window.showErrorMessage("You need to update your galasa path in your configurations of the Galasa extension.");
            return undefined;
        }
        if (!element) {
            let timings : Timing[] = [];
            timings.push(new Timing("Today", vscode.TreeItemCollapsibleState.Collapsed));
            timings.push(new Timing("Yesterday", vscode.TreeItemCollapsibleState.Collapsed));
            timings.push(new Timing("This Week", vscode.TreeItemCollapsibleState.Collapsed));
            timings.push(new Timing("Last Week", vscode.TreeItemCollapsibleState.Collapsed));
            timings.push(new Timing("Later", vscode.TreeItemCollapsibleState.Collapsed));
            return timings;
        } else if (element.label == "Today") {
            const endDate = new Date();
            let startDate = new Date();
            startDate.setHours(0,0,0,0);
            return this.getRuns(this.galasaRoot, startDate, endDate);
        } else if (element.label == "Yesterday") {
            let endDate = new Date();
            let startDate = new Date();
            endDate.setHours(0,0,0,0);
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0,0,0,0);
            return this.getRuns(this.galasaRoot, startDate, endDate);
        } else if (element.label == "This Week") {
            let endDate = new Date();
            endDate.setDate(endDate.getDate() - 1);
            endDate.setHours(0,0,0,0);
            let startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 6);
            return this.getRuns(this.galasaRoot, startDate, endDate);
        } else if (element.label == "Last Week") {
            let endDate = new Date();
            endDate.setDate(endDate.getDate() - 7);
            endDate.setHours(0,0,0,0);
            let startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 7);
            return this.getRuns(this.galasaRoot, startDate, endDate);
        } else if (element.label == "Later") {
            let endDate = new Date();
            endDate.setDate(endDate.getDate() - 14);
            endDate.setHours(0,0,0,0);
            return this.getRuns(this.galasaRoot, undefined, endDate);
        } else {
            return undefined;
        }
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
        const children = this.getChildren(undefined);
        if(children) {
            children.forEach(timing => {
                this._onDidChangeTreeData.fire(timing);
            });
        }
        
    }

    getRuns(galasaPath : string, start : Date | undefined, end : Date) : LocalRun[] {
        let runs : LocalRun[] = [];
        if (fs.existsSync(path.join(galasaPath, "ras"))) {
            fs.readdirSync(path.join(galasaPath, "ras")).forEach(file => {
                const filepath = path.join(galasaPath, "ras", file);
                if(fs.statSync(filepath).isDirectory() && fs.existsSync(path.join(filepath, "structure.json"))) {
                    const structure : any = JSON.parse(fs.readFileSync(path.join(galasaPath , "ras", file, "structure.json")).toString());
                    const status = structure.status;
                    let result = undefined;
                    if(status == "finished") {
                        result = structure.result;
                    }
                    const runStart = new Date(structure.startTime);
                    if(!start && runStart < end) {
                        runs.push(new LocalRun(file + " - " + structure.testShortName, vscode.TreeItemCollapsibleState.None, status, result, filepath, "localrun", structure));
                    } else if (start && runStart > start && runStart < end) {
                        runs.push(new LocalRun(file + " - " + structure.testShortName, vscode.TreeItemCollapsibleState.None, status, result, filepath, "localrun", structure));
                    }
                }
            });
        }
        runs.sort((run1, run2) => {
            return new Date(run2.structure.startTime).getTime() - new Date(run1.structure.startTime).getTime();
        });
        return runs;
    }
}


export class LocalRun extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private readonly status: string,
        private readonly result: string | undefined,
        public readonly path : string,
        public contextValue : string,
        public readonly structure : any
    ) {
        super(label, collapsibleState);

        switch (status) {
            case "stopping":
            case "discarding":
            case "ending":
            case "finished":
                if(result == "Passed") {
                    this.iconPath = new vscode.ThemeIcon("check");
                } else {
                    this.iconPath = new vscode.ThemeIcon("close");
                }
                break;
            case "running":
                this.iconPath = new vscode.ThemeIcon("debug-start");
                break;
            case "started":
            case "generating":
            case "building":
            case "provstart":
            default:
                this.iconPath = new vscode.ThemeIcon("loading");
                break;
        }

        this.command = getCommand(this);

        function getCommand(klass : any): vscode.Command | undefined {
            return {
                title: "Show Overview",
                command: "galasa-ras.overview",
                arguments: [klass]
            }
        }
    }
    
}

export class Timing extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}

