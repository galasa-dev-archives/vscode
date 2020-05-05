import * as vscode from 'vscode';
import { TestExtractor, TestCase } from './TestExtractor';
import { RASProvider, TestRun } from './TreeViewResultArchiveStore';
import { getDebugConfig } from './DebugConfigHandler';
const path = require('path');
const fs = require('fs');

export function activate(context: vscode.ExtensionContext) {

    // Configuration
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
        } else {
            return version;
        }
    });

    // Test Runner
    const testExtractor = new TestExtractor();
    vscode.window.registerTreeDataProvider("galasa-testrunner", testExtractor);
    vscode.commands.registerCommand('galasa-test.refresh', () => {testExtractor.refresh();});
    vscode.commands.registerCommand('galasa-test.debug', (run : TestCase) => {
        vscode.workspace.openTextDocument(run.pathToFile).then(doc => {
            vscode.window.showInformationMessage("Opened " + run.label + ", launch the debug now.");
            vscode.window.showTextDocument(doc,vscode.ViewColumn.Beside,false);
        });
        vscode.debug.startDebugging(undefined, getDebugConfig(context.extensionPath + "/lib/galasa-boot.jar", vscode.workspace.getConfiguration("galasa").get("maven-local"),
                                                    vscode.workspace.getConfiguration("galasa").get("maven-remote"), run));
    });

    //Result Archive Store
    const rasProvider = new RASProvider(vscode.workspace.getConfiguration("galasa").get("path") + "");
    vscode.window.registerTreeDataProvider("galasa-ras", rasProvider);
    vscode.commands.registerCommand("galasa-ras.refresh", () => rasProvider.refresh());
    vscode.commands.registerCommand('galasa-ras.open', (run : TestRun) => {
        vscode.workspace.openTextDocument(run.path).then(doc => {
            vscode.window.showTextDocument(doc,vscode.ViewColumn.Beside,true);
          });
    });
    vscode.commands.registerCommand("galasa-ras.clearAll", () => {
        let input = vscode.window.showInputBox({placeHolder: "Type YES if you want to PERMANELTY clear out your local RAS."});
        if (input) {
            input.then((text) => {
                if (text === "YES") {
                    rasProvider.clearAll();
                    vscode.window.showInformationMessage("TODO: The Result Archive Store needs to be cleared here.");
                } else {
                    vscode.window.showInformationMessage("The Result Archive Store has not been affected.");
                }
            });
        } else {
            vscode.window.showErrorMessage("There was an error trying to clear the Result Archive Store.");
        }
    });

    // General Galasa commands
    vscode.commands.registerCommand('galasa.specifyTestClass', config => { //TODO change to check manifest
        const active = vscode.window.activeTextEditor;
        
        if(active) {
            let text = active.document.getText();
            let packageStart = text.substring(text.indexOf("package"));
            let packageName = packageStart.substring(8, packageStart.indexOf(';'));
            let testName = active.document.fileName.substring(active.document.fileName.lastIndexOf('/') + 1, active.document.fileName.lastIndexOf('.java'));
            return packageName + "/" + packageName + "." + testName;
        }
    });
    
}