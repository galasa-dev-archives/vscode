import * as vscode from 'vscode';
import { DefaultApi, RASRequest } from 'galasa-web-api';
import { GalasaProperties } from './GalasaProperties';
const fs = require('fs');
const path = require('path');

export class RemoteTestExtractor implements vscode.TreeDataProvider<TestCase> {

    private _onDidChangeTreeData: vscode.EventEmitter<TestCase | undefined> = new vscode.EventEmitter<TestCase | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TestCase | undefined> = this._onDidChangeTreeData.event;

    private api : DefaultApi;
    private props : GalasaProperties;

    constructor(api : DefaultApi, props : GalasaProperties) {
        this.api = api;
        this.props = props;
    }
    
    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getTreeItem(element: TestCase): vscode.TreeItem {
		return element;
	}

    getChildren(element?: any): vscode.ProviderResult<any[]> {
        return this.getRemoteTests();
    }

    async getRemoteTests() : Promise<TestCase[]> {
        const trackedRuns = this.props.getTrackedRuns();
        
        let testFiles : TestCase[] = [];
        for(const runId of trackedRuns) {
            const runData : any = (await this.api.resultarchivePost({runName : runId})).body;
            let label = runId + " - " + runData.testStructure.testShortName + " - ";
            if(runData.testStructure.result != undefined) {
                label = label + runData.testStructure.result.toUpperCase();
            } else {
                label = label + runData.testStructure.status;
            }
            testFiles.push(new TestCase(label, runData));
        }
        
        return testFiles;
    }
}

export class TestCase extends vscode.TreeItem {

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
                if(data.testStructure.result == "failed") {
                    this.iconPath = new vscode.ThemeIcon("close");
                } else {
                    this.iconPath = new vscode.ThemeIcon("check");
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
