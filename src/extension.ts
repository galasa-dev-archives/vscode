import * as vscode from 'vscode';
import { TestExtractor, TestCase } from './TestExtractor';
import { RASProvider, TestArtifact} from './TreeViewLocalResultArchiveStore';
import { getDebugConfig, findTestArtifact, getGalasaVersion } from './DebugConfigHandler';
import {TerminalView} from "./ui/TerminalView";
const path = require('path');
import * as fs from 'fs';
import { createExampleFiles, launchSimbank } from './Examples';
import { DefaultApi } from 'galasa-web-api';
import { GalasaProperties } from './remote/GalasaProperties';
import { RemoteRASProvider } from './remote/TreeViewRemoteResultArchiveStore';
import { submitRuns } from './remote/SubmitRuns';
const galasaPath = process.env.HOME + "/" + ".galasa";

export function activate(context: vscode.ExtensionContext) {

    //Setup API
    const bootstrap : string | undefined = vscode.workspace.getConfiguration("galasa").get("bootstrap-endpoint");
    const props = new GalasaProperties(bootstrap);
    const api =  new DefaultApi(props.getEndpointUrl());

    //Setup Workspace
    vscode.commands.registerCommand('galasa-test.setupWorkspace', () => {
        let created : string[] = [];
        if(!fs.existsSync(galasaPath + "/credentials.properties")) {
            fs.writeFile(galasaPath + "/credentials.properties", "", function (err) {
                if (err) throw err;
            });
            created.push("credentials.properties");
        }
        if(!fs.existsSync(galasaPath + "/cps.properties")) {
            fs.writeFile(galasaPath + "/cps.properties", "", function (err) {
                if (err) throw err;
            });
            created.push("cps.properties");
        }
        if(!fs.existsSync(galasaPath + "/bootstrap.properties")) {
            fs.writeFile(galasaPath + "/bootstrap.properties", "", function (err) {
                if (err) throw err;
            });
            created.push("bootstrap.properties");
        }
        if(!fs.existsSync(galasaPath + "/dss.properties")) {
            fs.writeFile(galasaPath + "/dss.properties", "", function (err) {
                if (err) throw err;
            });
            created.push("dss.properties");
        }
        if(!fs.existsSync(galasaPath + "/overrides.properties")) {
            fs.writeFile(galasaPath + "/overrides.properties", "", function (err) {
                if (err) throw err;
            });
            created.push("overrides.properties");
        }
        if(created.length > 0) {
            let createdString : string = "Created:"
            created.forEach(element => {
                createdString = createdString + " " + element + ",";
            });
            createdString = createdString.substring(0, createdString.length - 1);
            vscode.window.showInformationMessage(createdString);
        } else {
            vscode.window.showInformationMessage("Workspace already setup");
        }
    });

    //Examples
    vscode.commands.registerCommand('galasa-test.createExamples', () => {
        createExampleFiles(context);
    });
    vscode.commands.registerCommand('galasa-test.simbank', () => {
        launchSimbank(context);
    });

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

    //Remote Testing
    vscode.commands.registerCommand("galasa-test.remoteTest", (run : TestCase) => {
        let filterActiveDocs = vscode.window.visibleTextEditors.filter(textDoc => {
            return textDoc.document.fileName.includes(run.label);
        });
        if (!filterActiveDocs || filterActiveDocs.length < 1) {
            vscode.workspace.openTextDocument(run.pathToFile).then(doc => {
                vscode.window.showInformationMessage("Opened " + run.label + ", the test will now be built and debugged.");
                vscode.window.showTextDocument(doc,vscode.ViewColumn.Active,false);
            });
        } else {
            vscode.window.showInformationMessage("You have already opened this testcase");
        }
        submitRuns(api, run);
    });

    // Test Runner
    const testExtractor = new TestExtractor();
    vscode.window.registerTreeDataProvider("galasa-testrunner", testExtractor);
    vscode.commands.registerCommand('galasa-test.refresh', () => {testExtractor.refresh();});
    vscode.commands.registerCommand('galasa-test.debug', async (run : TestCase) => {
        let filterActiveDocs = vscode.window.visibleTextEditors.filter(textDoc => {
            return textDoc.document.fileName.includes(run.label);
        });
        if (!filterActiveDocs || filterActiveDocs.length < 1) {
            vscode.workspace.openTextDocument(run.pathToFile).then(doc => {
                vscode.window.showInformationMessage("Opened " + run.label + ", the test will now be built and debugged.");
                vscode.window.showTextDocument(doc,vscode.ViewColumn.Active,false);
            });
        } else {
            vscode.window.showInformationMessage("You have already opened this testcase");
        }
        vscode.debug.startDebugging(undefined, await getDebugConfig(run, context));
    });

    //Local Result Archive Store
    const localRasProvider = new RASProvider(galasaPath);
    vscode.window.registerTreeDataProvider("galasa-ras", localRasProvider);
    vscode.commands.registerCommand("galasa-ras.refresh", () => localRasProvider.refresh());
    vscode.commands.registerCommand('galasa-ras.open', async (run : TestArtifact) => {
        if (run.collapsibleState === vscode.TreeItemCollapsibleState.None ) {
            if (run.label.includes(".gz")) { // GALASA TERMINAL SCREEN
                new TerminalView(run.path);
            } else {
                let filterActiveDocs = vscode.window.visibleTextEditors.filter(textDoc => {
                    return textDoc.document.fileName.includes(run.label);
                });
                if (!filterActiveDocs || filterActiveDocs.length < 1) {
                    vscode.workspace.openTextDocument(run.path).then(doc => {
                            vscode.window.showTextDocument(doc,vscode.ViewColumn.Beside,true);
                      });
                } else {
                    vscode.window.showInformationMessage("You have already opened this file.");
                }
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
                    localRasProvider.clearAll();
                    vscode.window.showInformationMessage("The Result Archive Store has been fully cleared out.");
                    localRasProvider.refresh();
                } else {
                    vscode.window.showInformationMessage("The Result Archive Store has not been affected.");
                }
            });
        } else {
            vscode.window.showErrorMessage("There was an error trying to clear the Result Archive Store.");
        }
        localRasProvider.refresh();
    });

    //Remote Result Archive Store
    const remoteRasProvider = new RemoteRASProvider("");
    vscode.window.registerTreeDataProvider("galasa-rasRemote", remoteRasProvider);
    vscode.commands.registerCommand("galasa-rasRemote.refresh", () => remoteRasProvider.refresh());
    vscode.commands.registerCommand('galasa-rasRemote.open', async (run : TestArtifact) => {
        if (run.collapsibleState === vscode.TreeItemCollapsibleState.None ) { 
            let filterActiveDocs = vscode.window.visibleTextEditors.filter(textDoc => {
                return textDoc.document.fileName.includes(run.label);
            });
            if (!filterActiveDocs || filterActiveDocs.length < 1) {
                //TODO
            } else {
                vscode.window.showInformationMessage("You have already opened this file.");
            }              
        } else {
            vscode.window.showErrorMessage("You tried to display a directory, " + run.label);
        }
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