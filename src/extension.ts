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
import { RasItem } from './remote/RasItem';
import { RemoteTestExtractor, RemoteTestCase } from './remote/RemoteTestExtractor'
import { RemoteProvider } from './remote/RemoteProvider';
const galasaPath = process.env.HOME + "/" + ".galasa";

export function activate(context: vscode.ExtensionContext) {

    //Setup API
    const bootstrap : string | undefined = vscode.workspace.getConfiguration("galasa").get("bootstrap-endpoint");
    const props = new GalasaProperties(bootstrap, galasaPath);
    const api =  new DefaultApi(props.getEndpointUrl());

    //vscode.workspace.registerTextDocumentContentProvider("RemoteTesting", myProvider);

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
    vscode.commands.registerCommand("galasa-test.remoteTest", async (run : TestCase) => {
        const runId = await submitRuns(api, run, props);
        if(!runId) {
            vscode.window.showInformationMessage("Remote Test " + run.label + " cancelled");
        }
    });
    const remoteTestExtractor = new RemoteTestExtractor(api, props);
    vscode.window.registerTreeDataProvider("galasa-testRemote", remoteTestExtractor);
    vscode.commands.registerCommand("galasa-testRemote.refresh", () => {remoteTestExtractor.refresh();});
    vscode.commands.registerCommand("galasa-testRemote.openLog", (run: RemoteTestCase) => {
        props.getLog(run.data.runlog, run.data.testStructure.runName);
    });
    vscode.commands.registerCommand("galasa-testRemote.delete", (run : RemoteTestCase) => {
        props.removeRun(run.data.testStructure.runName);
    });
    const remoteRasProvider = new RemoteRASProvider(api);
    vscode.window.registerTreeDataProvider("galasa-rasRemote", remoteRasProvider);
    vscode.commands.registerCommand("galasa-rasRemote.refresh", () => remoteRasProvider.refresh());
    vscode.commands.registerCommand("galasa-testRemote.artifacts", (run:RemoteTestCase) => {
        remoteRasProvider.setRun(run);
        remoteRasProvider.refresh();
    });
    vscode.commands.registerCommand("galasa-rasRemote.open", async (item:RasItem) => {
        if (item.collapsibleState === vscode.TreeItemCollapsibleState.None ) {
            if (item.label.endsWith(".gz")) { // GALASA TERMINAL SCREEN
                new TerminalView(undefined, item.data);
            } else {
                let filterActiveDocs = vscode.window.visibleTextEditors.filter(textDoc => {
                    return textDoc.document.fileName.includes(item.label);
                });
                if (!filterActiveDocs || filterActiveDocs.length < 1) {
                    let returnString = "";
                    returnString = item.data.toString();

                    const provider = new RemoteProvider(item.label, returnString);
                    

                    vscode.workspace.registerTextDocumentContentProvider("remote", provider);

                    let uri = vscode.Uri.parse('remote:' + item.label);
                    let doc = await vscode.workspace.openTextDocument(uri);

                    await vscode.window.showTextDocument(doc, { preview: false });
                } else {
                    vscode.window.showInformationMessage("You have already opened this file.");
                }
            }            
        } else {
            vscode.window.showErrorMessage("You tried to display a directory, " + item.label);
        }
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
            if (run.label.endsWith(".gz")) { // GALASA TERMINAL SCREEN
                new TerminalView(fs.readFileSync(run.path), undefined);
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