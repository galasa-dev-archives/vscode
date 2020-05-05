import * as vscode from 'vscode';
import { TestExtractor, TestCase } from './TestExtractor';
import { RASProvider, TestRun } from './TreeViewResultArchiveStore';
import { getDebugConfig, findTestArtifact, getGalasaVersion } from './DebugConfigHandler';
const path = require('path');
const fs = require('fs');
const galasaPath = process.env.HOME + "/" + ".galasa";

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
        return getGalasaVersion();
    });

    // Test Runner
    const testExtractor = new TestExtractor();
    vscode.window.registerTreeDataProvider("galasa-testrunner", testExtractor);
    vscode.commands.registerCommand('galasa-test.refresh', () => {testExtractor.refresh();});
    vscode.commands.registerCommand('galasa-test.debug', async (run : TestCase) => {
        const filterActiveDocs = vscode.workspace.textDocuments.filter(textDoc => {
            return textDoc.fileName.includes(run.label);
        });
        if (filterActiveDocs.length < 1 || !filterActiveDocs ) {
            vscode.workspace.openTextDocument(run.pathToFile).then(doc => {
                vscode.window.showInformationMessage("Opened " + run.label + ", the test will now be build and debugged.");
                vscode.window.showTextDocument(doc,vscode.ViewColumn.Beside,false);
            });
        } else {
            vscode.window.showInformationMessage("You have already opened this testcase");
        }
        vscode.debug.startDebugging(undefined, await getDebugConfig(context.extensionPath + "/lib/galasa-boot.jar", vscode.workspace.getConfiguration("galasa").get("maven-local"),
                                                    vscode.workspace.getConfiguration("galasa").get("maven-remote"), run));
    });

    //Result Archive Store
    const rasProvider = new RASProvider(galasaPath);
    vscode.window.registerTreeDataProvider("galasa-ras", rasProvider);
    vscode.commands.registerCommand("galasa-ras.refresh", () => rasProvider.refresh());
    vscode.commands.registerCommand('galasa-ras.open', (run : TestRun) => {
        if (run.collapsibleState === vscode.TreeItemCollapsibleState.None ) {
            const filterActiveDocs = vscode.workspace.textDocuments.filter(textDoc => {
                return textDoc.fileName.includes(run.label);
            });
            if (filterActiveDocs.length < 1 || !filterActiveDocs ) {
                vscode.workspace.openTextDocument(run.path).then(doc => {
                    vscode.window.showTextDocument(doc,vscode.ViewColumn.Beside,true);
                  });
            } else {
                vscode.window.showInformationMessage("You have already opened this file.");
            }
        } else {
            vscode.window.showErrorMessage("You tried to display a directory, " + run.label);
        }
    });
    vscode.commands.registerCommand("galasa-ras.clearAll", () => {
        let input = vscode.window.showInputBox({placeHolder: "Type YES if you want to PERMANELTY clear out your local RAS."});
        if (input) {
            input.then((text) => {
                if (text === "YES") {
                    rasProvider.clearAll();
                    vscode.window.showInformationMessage("The Result Archive Store has been fully cleared out.");
                    rasProvider.refresh();
                } else {
                    vscode.window.showInformationMessage("The Result Archive Store has not been affected.");
                }
            });
        } else {
            vscode.window.showErrorMessage("There was an error trying to clear the Result Archive Store.");
        }
        rasProvider.refresh();
    });

    // General Galasa commands
    vscode.commands.registerCommand('galasa.specifyTestClass', config => {
        const active = vscode.window.activeTextEditor;
        if(active) {
            const fileName = active.document.fileName;
            let testCase = new TestCase(fileName.substring(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf('.java')), fileName);
            return findTestArtifact(testCase);
        }
    });
    
}