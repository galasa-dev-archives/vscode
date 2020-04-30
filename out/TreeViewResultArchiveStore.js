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
        if (!element) {
            return this.getDirectories(this.galasaRoot + "/ras/");
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
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
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