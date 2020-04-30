import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Test } from 'mocha';

export class RASProvider implements vscode.TreeDataProvider<TestRun> {
    constructor(private galasaRoot: string) { }

    getTreeItem(element: TestRun): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TestRun): TestRun[] | undefined {
        if (!element) {
            return this.getDirectories(this.galasaRoot + "/ras/");
        } else {
            return this.getDirectories(element.path);
        }
    }

    private getDirectories(path: string): TestRun[] {
        let list: TestRun[] = Array(0);
        fs.readdirSync(path).forEach(file => {
            if (fs.statSync(path  + "/" + file).isDirectory()) {
                list.push(new TestRun(file, vscode.TreeItemCollapsibleState.Collapsed, path  + "/" + file));
            } else {
                list.push(new TestRun(file, vscode.TreeItemCollapsibleState.None, path  + "/" + file));
            }
        });
        return list;
    }

    private pathExists(p: string): boolean {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }
        return true;
    }

    private _onDidChangeTreeData: vscode.EventEmitter<TestRun | undefined> = new vscode.EventEmitter<TestRun | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TestRun | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export class TestRun extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly path:string
    ) {
        super(label, collapsibleState);
    }
}

