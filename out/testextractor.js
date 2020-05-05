"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require('fs');
const path = require('path');
class TestExtractor {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return this.getWorkspaceTests();
    }
    getWorkspaceTests() {
        return __awaiter(this, void 0, void 0, function* () {
            const javaFiles = yield vscode.workspace.findFiles("**/*.java");
            let testFiles = [];
            javaFiles.forEach(file => {
                let fileName = file.toString().substring(7);
                if (fileName.includes("%40")) {
                    fileName = fileName.replace("%40", "@");
                }
                const data = fs.readFileSync(fileName).toString();
                if (data.includes("@Test") && data.includes("import dev.galasa.Test;")) {
                    var name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf(".java"));
                    testFiles.push(new TestCase(name, file.path));
                }
            });
            return testFiles;
        });
    }
}
exports.TestExtractor = TestExtractor;
class TestCase extends vscode.TreeItem {
    constructor(label, pathToFile) {
        super(label);
        this.label = label;
        this.pathToFile = pathToFile;
        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'GalasaLogo.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'GalasaLogo.svg')
        };
    }
}
exports.TestCase = TestCase;
//# sourceMappingURL=TestExtractor.js.map