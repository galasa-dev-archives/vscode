import * as vscode from 'vscode';
import { DefaultApi } from 'galasa-web-api';
const fs = require('fs');
const path = require('path');

export class RemoteTestExtractor implements vscode.TreeDataProvider<TestCase> {

    private _onDidChangeTreeData: vscode.EventEmitter<TestCase | undefined> = new vscode.EventEmitter<TestCase | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TestCase | undefined> = this._onDidChangeTreeData.event;

    private api : DefaultApi;

    constructor(api : DefaultApi) {
        this.api = api;
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
        const runResults = await this.api.allrunsGet();

        let testFiles : TestCase[] = [];
        runResults.body.forEach(data => {
            let label = data.name + " - " + data.testName.substring(data.testName.lastIndexOf(".") + 1, data.testName.length) + " - ";
            if(data.result != undefined) {
                label = label + data.result.toUpperCase();
            } else {
                label = label + data.status;
            }
            testFiles.push(new TestCase(label, data));
        });
        
        return testFiles;
    }
}

export class TestCase extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly data : any,
	) {
        super(label);

        switch (data.status) {
            case "stopping":
            case "discarding":
            case "ending":
            case "finished":
                if(data.result == "failed") {
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
