"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const TestExtractor_1 = require("./TestExtractor");
const TreeViewResultArchiveStore_1 = require("./TreeViewResultArchiveStore");
const path = require('path');
const fs = require('fs');
function activate(context) {
    const testExtractor = new TestExtractor_1.TestExtractor();
    vscode.window.registerTreeDataProvider("galasa-testrunner", testExtractor);
    vscode.commands.registerCommand('galasa-test.refresh', () => { testExtractor.refresh(); });
    vscode.commands.registerCommand('galasa.bootjar', config => {
        return context.extensionPath + "/lib/galasa-boot.jar";
    });
    vscode.commands.registerCommand('galasa.localmaven', config => {
        return "--localmaven file:" + vscode.workspace.getConfiguration("galasa").get("maven-local");
    });
    vscode.commands.registerCommand('galasa.remotemaven', config => {
        return "--remotemaven " + vscode.workspace.getConfiguration("galasa").get("maven-remote");
    });
    vscode.commands.registerCommand('galasa.version', config => {
        const version = vscode.workspace.getConfiguration("galasa").get("version");
        if (version === "LATEST") {
            return "0.7.0";
        }
        else {
            return version;
        }
    });
    vscode.commands.registerCommand('galasa.specifyTestClass', config => {
        const active = vscode.window.activeTextEditor;
        if (active) {
            let text = active.document.getText();
            let packageStart = text.substring(text.indexOf("package"));
            let packageName = packageStart.substring(8, packageStart.indexOf(';'));
            let testName = active.document.fileName.substring(active.document.fileName.lastIndexOf('/') + 1, active.document.fileName.lastIndexOf('.java'));
            return packageName + "/" + packageName + "." + testName;
        }
    });
    vscode.commands.registerCommand('galasa-test.debug', (run) => {
        vscode.workspace.openTextDocument(run.pathToFile).then(doc => {
            vscode.window.showInformationMessage("Opened " + run.label + ", launch the debug now.");
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside, false);
        });
    });
    //RAS
    const rasProvider = new TreeViewResultArchiveStore_1.RASProvider(vscode.workspace.getConfiguration("galasa").get("path") + "");
    vscode.window.registerTreeDataProvider("galasa-ras", rasProvider);
    vscode.commands.registerCommand("galasa-ras.refresh", () => rasProvider.refresh());
    vscode.commands.registerCommand('galasa-ras.open', (run) => {
        vscode.workspace.openTextDocument(run.path).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside, true);
        });
    });
    vscode.commands.registerCommand("galasa-ras.clearAll", () => {
        let input = vscode.window.showInputBox({ placeHolder: "Type YES if you want to PERMANELTY clear out your local RAS." });
        if (input) {
            input.then((text) => {
                if (text === "YES") {
                    rasProvider.clearAll();
                    vscode.window.showInformationMessage("The Result Archive Store needs to be cleared here");
                }
                else {
                    vscode.window.showInformationMessage("The Result Archive Store will not be affected");
                }
            });
        }
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map