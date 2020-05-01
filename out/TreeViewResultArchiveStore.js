"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
class RASProvider {
    constructor(galasaRoot) {
        this.galasaRoot = galasaRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (this.galasaRoot === "" || !this.galasaRoot) {
            vscode.window.showErrorMessage("You need to update your galasa path in your configurations of the Galasa extension.");
            return undefined;
        }
        if (!element) {
            return this.getDirectories(this.galasaRoot + "/ras").sort((run1, run2) => {
                if (fs.statSync(run1.path).mtime > fs.statSync(run2.path).mtime) {
                    return -1;
                }
                if (fs.statSync(run1.path).mtime = fs.statSync(run2.path).mtime) {
                    return 0;
                }
                else {
                    return 1;
                }
            });
        }
        else {
            return this.getDirectories(element.path);
        }
    }
    getDirectories(path) {
        let list = Array(0);
        fs.readdirSync(path).forEach(file => {
            if (fs.statSync(path + "/" + file).isDirectory()) {
                list.push(new TestRun(file, this.toDate(fs.statSync(path + "/" + file)), vscode.TreeItemCollapsibleState.Collapsed, path + "/" + file));
            }
            else {
                list.push(new TestRun(file, "", vscode.TreeItemCollapsibleState.None, path + "/" + file));
            }
        });
        return list;
    }
    toDate(date) {
        const mtime = date.mtime;
        return "Changes: " + mtime.getUTCDate() + "/" + mtime.getUTCMonth() + "---" + mtime.getUTCHours() + ":" + mtime.getUTCMinutes() + ":" + mtime.getUTCSeconds();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.RASProvider = RASProvider;
class TestRun extends vscode.TreeItem {
    constructor(label, lastTimeChanged, collapsibleState, path) {
        super(label, collapsibleState);
        this.label = label;
        this.lastTimeChanged = lastTimeChanged;
        this.collapsibleState = collapsibleState;
        this.path = path;
    }
    get description() {
        return this.lastTimeChanged;
    }
}
exports.TestRun = TestRun;
//# sourceMappingURL=TreeViewResultArchiveStore.js.map