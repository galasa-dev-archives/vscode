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
                list.push(new TestRun(file, vscode.TreeItemCollapsibleState.Collapsed, path + "/" + file));
            }
            else {
                list.push(new TestRun(file, vscode.TreeItemCollapsibleState.None, path + "/" + file));
            }
        });
        return list;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    clearAll() {
        fs.readdirSync(this.galasaRoot + "/ras").forEach((file) => {
            let filePath = this.galasaRoot + "/ras/" + file;
            if (fs.statSync(filePath).isDirectory()) {
                console.log("TO DO: RM Directory");
            }
            else {
                console.log("TO DO: RM File");
            }
        });
        this.refresh();
    }
}
exports.RASProvider = RASProvider;
class TestRun extends vscode.TreeItem {
    constructor(label, collapsibleState, path) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.path = path;
    }
}
exports.TestRun = TestRun;
//# sourceMappingURL=TreeViewResultArchiveStore.js.map