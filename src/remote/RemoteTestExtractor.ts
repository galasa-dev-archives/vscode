import * as vscode from 'vscode';
import * as ras from "galasa-ras-api"
import { GalasaProperties } from './GalasaProperties';
const fs = require('fs');
const path = require('path');

export class RemoteTestExtractor implements vscode.TreeDataProvider<RemoteTestCase> {

    private _onDidChangeTreeData: vscode.EventEmitter<RemoteTestCase | undefined> = new vscode.EventEmitter<RemoteTestCase | undefined>();
    readonly onDidChangeTreeData: vscode.Event<RemoteTestCase | undefined> = this._onDidChangeTreeData.event;

    private api : ras.DefaultApi;
    private props : GalasaProperties;

    constructor(api : ras.DefaultApi, props : GalasaProperties) {
        this.api = api;
        this.props = props;
    }
    
    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: RemoteTestCase): vscode.TreeItem {
		return element;
	}

    getChildren(element?: any): vscode.ProviderResult<any[]> {
        return this.getRemoteTests();
    }

    async getRemoteTests() : Promise<RemoteTestCase[]> {
        const trackedRuns = this.props.getTrackedRuns();
        
        let testFiles : RemoteTestCase[] = [];
        for(const runId of trackedRuns) {
            const runData : any = (await this.api.rasRunNameGet(runId)).body;
            let label = runId + " - " + runData.testStructure.testShortName + " - ";
            if(runData.testStructure.result != undefined) {
                label = label + runData.testStructure.result.toUpperCase();
            } else {
                label = label + runData.testStructure.status;
            }
            testFiles.push(new RemoteTestCase(label, runData));
        }
        
        return testFiles;
    }
}

export class RemoteTestCase extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly data : any,
	) {
        super(label);

        switch (data.testStructure.status) {
            case "stopping":
            case "discarding":
            case "ending":
            case "finished":
                if(data.testStructure.result == "passed") {
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
    }
}
