import * as vscode from 'vscode';
import { TestExtractor, TestCase } from './TestExtractor';
import { RASProvider, LocalRun} from './TreeViewLocalResultArchiveStore';
import { getDebugConfig, findTestArtifact, getGalasaVersion } from './DebugConfigHandler';
import {TerminalView} from "./ui/TerminalView";
import * as fs from 'fs';
import { createExampleFiles, launchSimbank } from './Examples';
import { ArtifactProvider, ArtifactItem } from './TreeViewArtifacts';
import rimraf = require('rimraf');
import { EnvironmentProvider, Property } from './TreeViewEnvironmentProperties';
import { selectEnvrionment, addProperty, editProperty, deleteProperty, deleteEnvironment } from './EnvironmentController';
import { showOverview } from './ui/RunOverview';
// import * as cps from 'galasa-cps-api';
// import * as ras from 'galasa-ras-api';
// import * as runs from 'galasa-runs-api';
// import { GalasaProperties } from './remote/GalasaProperties';
// import { RemoteRASProvider } from './remote/TreeViewRemoteResultArchiveStore';
// import { submitRuns } from './remote/SubmitRuns';
// import { RasItem } from './remote/RasItem';
// import { RemoteTestExtractor, RemoteTestCase } from './remote/RemoteTestExtractor'
// import { RemoteProvider } from './remote/RemoteProvider';
const galasaPath = process.env.HOME + "/" + ".galasa";

export function activate(context: vscode.ExtensionContext) {

    setupWorkspace();

    //Setup API
    // const bootstrap : string | undefined = vscode.workspace.getConfiguration("galasa").get("bootstrap-endpoint");
    // const props = new GalasaProperties(bootstrap, galasaPath);
    // const cpsApi =  new cps.DefaultApi(props.getEndpointUrl());
    // const rasApi =  new ras.DefaultApi(props.getEndpointUrl());
    // const runsApi =  new runs.DefaultApi(props.getEndpointUrl());

    //vscode.workspace.registerTextDocumentContentProvider("RemoteTesting", myProvider);

    //Setup Workspace
    vscode.commands.registerCommand('galasa-test.setupWorkspace', () => {
        let created : string[] = setupWorkspace();
        
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

    //Remote Testing
    // vscode.commands.registerCommand("galasa-test.remoteTest", async (run : TestCase) => {
    //     const runId = await submitRuns(cpsApi, runsApi, run, props);
    //     if(!runId) {
    //         vscode.window.showInformationMessage("Remote Test " + run.label + " cancelled");
    //     }
    // });
    // const remoteTestExtractor = new RemoteTestExtractor(rasApi, props);
    // vscode.window.registerTreeDataProvider("galasa-testRemote", remoteTestExtractor);
    // vscode.commands.registerCommand("galasa-testRemote.refresh", () => {remoteTestExtractor.refresh();});
    // vscode.commands.registerCommand("galasa-testRemote.openLog", (run: RemoteTestCase) => {
    //     props.getLog(run.data.runlog, run.data.testStructure.runName);
    // });
    // vscode.commands.registerCommand("galasa-testRemote.delete", (run : RemoteTestCase) => {
    //     props.removeRun(run.data.testStructure.runName);
    //     remoteTestExtractor.refresh();
    // });
    // const remoteRasProvider = new RemoteRASProvider(rasApi);
    // vscode.window.registerTreeDataProvider("galasa-rasRemote", remoteRasProvider);
    // vscode.commands.registerCommand("galasa-rasRemote.refresh", () => remoteRasProvider.refresh());
    // vscode.commands.registerCommand("galasa-testRemote.artifacts", (run:RemoteTestCase) => {
    //     remoteRasProvider.setRun(run);
    //     remoteRasProvider.refresh();
    // });
    // vscode.commands.registerCommand("galasa-rasRemote.open", async (item:RasItem) => {
    //     if (item.collapsibleState === vscode.TreeItemCollapsibleState.None ) {
    //         if (item.label.endsWith(".gz")) { // GALASA TERMINAL SCREEN
    //             new TerminalView(undefined, item.data);
    //         } else {
    //             let filterActiveDocs = vscode.window.visibleTextEditors.filter(textDoc => {
    //                 return textDoc.document.fileName.includes(item.label);
    //             });
    //             if (!filterActiveDocs || filterActiveDocs.length < 1) {
    //                 let returnString = "";
    //                 returnString = item.data.toString();

    //                 const provider = new RemoteProvider(item.label, returnString);
                    

    //                 vscode.workspace.registerTextDocumentContentProvider("remote", provider);

    //                 let uri = vscode.Uri.parse('remote:' + item.label);
    //                 let doc = await vscode.workspace.openTextDocument(uri);

    //                 await vscode.window.showTextDocument(doc, { preview: false });
    //             } else {
    //                 vscode.window.showInformationMessage("You have already opened this file.");
    //             }
    //         }            
    //     } else {
    //         vscode.window.showErrorMessage("You tried to display a directory, " + item.label);
    //     }
    // });
    

    // Test Runner
    vscode.commands.registerCommand('galasa-test.debug', async () => {
        const activeDoc = vscode.window.activeTextEditor;
        if (activeDoc) {
            if (activeDoc.document.getText().indexOf("@Test") != -1 && activeDoc.document.getText().indexOf("import dev.galasa.Test;") != -1 && activeDoc.document.uri.fsPath.endsWith(".java")) {
                let path = activeDoc.document.uri.fsPath;
                const test = new TestCase(path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf(".java")), path);
                vscode.debug.startDebugging(undefined, await getDebugConfig(test, galasaPath, context, environmentProvider));
            } else {
                vscode.window.showErrorMessage("You do not have a viable Galasa test opened.")
            }
            
        } else {
            vscode.window.showErrorMessage("Could not retrieve the currently active text editor.")
        }

        //vscode.debug.startDebugging(undefined, await getDebugConfig(new TestCase(), galasaPath ,context));
    });

    //Environment Properties
    const environmentProvider = new EnvironmentProvider(galasaPath);
    vscode.window.registerTreeDataProvider("galasa-environment", environmentProvider);
    vscode.commands.registerCommand("galasa-environment.search", () => {
        selectEnvrionment(galasaPath, environmentProvider);
    });
    vscode.commands.registerCommand("galasa-environment.add", () => {
        addProperty(environmentProvider);
    });
    vscode.commands.registerCommand("galasa-environment.deleteEnv", () => {
        deleteEnvironment(galasaPath, environmentProvider);
    });
    vscode.commands.registerCommand("galasa-environment.edit", (property : Property) => {
        editProperty(property, environmentProvider);
    });
    vscode.commands.registerCommand("galasa-environment.delete", (property : Property) => {
        deleteProperty(property, environmentProvider);
    });

    //Local Runs
    const localRasProvider = new RASProvider(galasaPath);
    vscode.window.registerTreeDataProvider("galasa-ras", localRasProvider);
    vscode.commands.registerCommand("galasa-ras.refresh", () => localRasProvider.refresh());
    vscode.commands.registerCommand('galasa-ras.runlog', (run : LocalRun) => {
        vscode.workspace.openTextDocument(run.path + "/run.log").then(doc => {
            vscode.window.showTextDocument(doc,vscode.ViewColumn.Active,true);
        });
    });
    const localArtifactProvider = new ArtifactProvider();
    vscode.window.registerTreeDataProvider("galasa-artifacts", localArtifactProvider);
    vscode.commands.registerCommand('galasa-ras.artifacts', (run : LocalRun) => {
        localArtifactProvider.setRun(run);
    });
    vscode.commands.registerCommand("galasa-ras.delete", (run : LocalRun) => {
        rimraf(run.path, () => {});
        localRasProvider.refresh();
    });
    vscode.commands.registerCommand("galasa-artifacts.open", (artifact : ArtifactItem) => {
        if (artifact.label.endsWith(".gz")) { // GALASA TERMINAL SCREEN
            new TerminalView(fs.readFileSync(artifact.path), undefined);
        } else {
            let filterActiveDocs = vscode.window.visibleTextEditors.filter(textDoc => {
                return textDoc.document.fileName.includes(artifact.label);
            });
            if (!filterActiveDocs || filterActiveDocs.length < 1) {
                vscode.workspace.openTextDocument(artifact.path).then(doc => {
                        vscode.window.showTextDocument(doc,vscode.ViewColumn.Active,true);
                    });
            } else {
                vscode.window.showInformationMessage("You have already opened this file.");
            }
        }
    });
    let activeLabel = "";
    vscode.commands.registerCommand("galasa-ras.overview", (run : LocalRun) => {
        if(activeLabel != run.label) {
            activeLabel = run.label;
        } else {
            activeLabel = "";
            showOverview(run);
        }
    });
}

function setupWorkspace() : string[] {
    let created : string[] = []
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
    if(!fs.existsSync(galasaPath + "/vscode")) {
        fs.mkdirSync(galasaPath + "/vscode");
        created.push("vscode");
    }
    return created;
}