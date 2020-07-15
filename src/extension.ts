import * as vscode from 'vscode';
import { RASProvider, LocalRun} from './local/views/TreeViewLocalResultArchiveStore';
import { getDebugConfig, findTestArtifact, TestCase, GherkinTestCase } from './local/debugger/DebugConfigHandler';
import { TerminalView } from "./webviews/terminal/TerminalView";
import * as fs from 'fs';
import * as path from 'path';
import { createExampleFiles, launchSimbank } from './local/Examples';
import { ArtifactProvider, ArtifactItem } from './local/views/TreeViewArtifacts';
import rimraf = require('rimraf');
import { EnvironmentProvider, GalasaEnvironment } from './local/views/TreeViewEnvironmentProperties';
import { showOverview } from './webviews/RunOverview';
import {CodeProvider} from "./webviews/CodeProvider";
import { GalasaConfigurationProvider } from "./local/debugger/GalasaConfigurationProvider";
import commentjson = require('comment-json');
import { addEnvrionment, deleteEnvironment } from './local/EnvironmentController';
import { setupWorkspace } from './config/setup';

const galasaPath = path.join(process.env.HOME ? process.env.HOME : "", ".galasa");

export function activate(context: vscode.ExtensionContext) {

    setupWorkspace(context, galasaPath);

    let activeLabel = "";

    //Examples
    vscode.commands.registerCommand('galasa-test.createExamples', () => {
        createExampleFiles(context);
    });
    vscode.commands.registerCommand('galasa-test.simbank', () => {
        launchSimbank(context);
    });    

    // Test Runner
    vscode.commands.registerCommand('galasa-test.debug', async () => {
        const activeDoc = vscode.window.activeTextEditor;
        if (activeDoc) {
            if (activeDoc.document.getText().includes("@Test") && activeDoc.document.getText().includes("import dev.galasa.Test;") && activeDoc.document.uri.fsPath.endsWith(".java")) {
                let docPath = activeDoc.document.uri.fsPath;
                let test : TestCase;
                if(docPath.lastIndexOf("/") != -1) {
                    test = new TestCase(docPath.substring(docPath.lastIndexOf("/") + 1, docPath.lastIndexOf(".java")), docPath);
                } else {
                    test = new TestCase(docPath.substring(docPath.lastIndexOf("\\") + 1, docPath.lastIndexOf(".java")), docPath);
                }
                vscode.debug.startDebugging(undefined, await getDebugConfig(test, galasaPath, context, environmentProvider));
            } else if (activeDoc.document.getText().includes("Feature:") && activeDoc.document.uri.fsPath.endsWith(".feature")) {
                let docPath = activeDoc.document.uri.fsPath;
                let test : GherkinTestCase;
                if(docPath.lastIndexOf("/") != -1) {
                    test = new GherkinTestCase(docPath.substring(docPath.lastIndexOf("/") + 1, docPath.lastIndexOf(".feature")), activeDoc.document.uri);
                } else {
                    test = new GherkinTestCase(docPath.substring(docPath.lastIndexOf("\\") + 1, docPath.lastIndexOf(".feature")), activeDoc.document.uri);
                }
                vscode.debug.startDebugging(undefined, await getDebugConfig(test, galasaPath, context, environmentProvider));
            } else {
                vscode.window.showErrorMessage("You do not have a viable Galasa test opened.")
            }
        } else {
            vscode.window.showErrorMessage("Could not retrieve the currently active text editor.")
        }
    });
    let codelensProvider = new CodeProvider();
    vscode.languages.registerCodeLensProvider({language: "java"}, codelensProvider);

    vscode.commands.registerCommand("galasa-test.export", async () => {
        const activeDoc = vscode.window.activeTextEditor;
        if (activeDoc) {
            if ((activeDoc.document.getText().includes("@Test") && activeDoc.document.getText().includes("import dev.galasa.Test;") && activeDoc.document.uri.fsPath.endsWith(".java")) ||
                    (activeDoc.document.uri.fsPath.endsWith(".feature") && activeDoc.document.getText().includes("Feature:"))) {
                if (vscode.workspace.workspaceFolders) {
                    const launchPath = path.join(vscode.workspace.workspaceFolders[0]?.uri.fsPath, ".vscode", "launch.json");
                    let testcase;
                    let gherkincase;
                    let filename = activeDoc.document.fileName;
                    if (activeDoc.document.uri.fsPath.endsWith(".java")) {
                        if (activeDoc.document.uri.fsPath.lastIndexOf("/") != -1) {
                            testcase = new TestCase(filename.substring(filename.lastIndexOf("/") + 1, filename.lastIndexOf(".java")), activeDoc.document.uri.fsPath);
                        } else {
                            testcase = new TestCase(filename.substring(filename.lastIndexOf("\\") + 1, filename.lastIndexOf(".java")), activeDoc.document.uri.fsPath);
                        }
                    } else {
                        if (activeDoc.document.uri.fsPath.lastIndexOf("/") != -1) {
                            gherkincase = new GherkinTestCase(filename.substring(filename.lastIndexOf("/") + 1, filename.lastIndexOf(".feature")), activeDoc.document.uri);
                        } else {
                            gherkincase = new GherkinTestCase(filename.substring(filename.lastIndexOf("\\") + 1, filename.lastIndexOf(".feature")), activeDoc.document.uri);
                        }
                    }
                    if(!fs.existsSync(launchPath)) {
                        if (!fs.existsSync(path.join(vscode.workspace.workspaceFolders[0]?.uri.fsPath, ".vscode"))) {
                            fs.mkdirSync(path.join(vscode.workspace.workspaceFolders[0]?.uri.fsPath, ".vscode"));
                        }
                        let launchJson: any = `{
                            "version": "0.2.0",
                            "configurations": []
                        }`;
                        fs.writeFileSync(launchPath, JSON.stringify(JSON.parse(launchJson), undefined, 4));
                    }
                    
                    let launch = commentjson.parse(fs.readFileSync(launchPath).toString());
                    let config = JSON.parse(fs.readFileSync(path.join(context.extensionPath, "package.json")).toString()).contributes.debuggers[0].initialConfigurations[0];
                    if (testcase) {
                        config.testclass = findTestArtifact(testcase);
                        config.name = testcase.label;
                    } else if(gherkincase) {
                        config.testclass = "";
                        config.gherkinFeature = gherkincase.uri.toString().replace("%40", "@");
                        config.name = gherkincase.label;
                    }
                    
                    launch.configurations.push(config);
                    fs.writeFileSync(launchPath, commentjson.stringify(launch, undefined, 4));

                    vscode.workspace.openTextDocument(launchPath).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
               
            } else {
                vscode.window.showErrorMessage("You do not have a viable Galasa test opened.")
            }
        } else {
            vscode.window.showErrorMessage("Could not retrieve the currently active text editor.")
        }
    });

    //Environment Properties
    const environmentProvider = new EnvironmentProvider(galasaPath);
    vscode.window.registerTreeDataProvider("galasa-environment", environmentProvider);
    vscode.commands.registerCommand("galasa-environment.refresh", () => {
        environmentProvider.refresh();
    });
    vscode.commands.registerCommand("galasa-envionment.addEnv", () => {
        addEnvrionment(galasaPath, environmentProvider);
    });
    vscode.commands.registerCommand("galasa-envionment.delEnv", (env : GalasaEnvironment) => {
        deleteEnvironment(env, environmentProvider);
    });
    vscode.commands.registerCommand("galasa-envionment.active", (env : GalasaEnvironment) => {
        environmentProvider.setEnvironment(env.envPath);
    });
    vscode.commands.registerCommand("galasa-environment.open", (env : GalasaEnvironment) => {
        if(activeLabel != env.label) {
            activeLabel = env.label;
        } else {
            activeLabel = "";
            vscode.workspace.openTextDocument(env.envPath).then(doc => {
                vscode.window.showTextDocument(doc,vscode.ViewColumn.Active,true);
            });
        }
    });

    //Local Runs
    const localRasProvider = new RASProvider(galasaPath);
    vscode.window.registerTreeDataProvider("galasa-ras", localRasProvider);
    vscode.commands.registerCommand("galasa-ras.refresh", () => localRasProvider.refresh());
    vscode.commands.registerCommand('galasa-ras.runlog', (run : LocalRun) => {
        vscode.workspace.openTextDocument(path.join(run.runPath, "run.log")).then(doc => {
            vscode.window.showTextDocument(doc,vscode.ViewColumn.Active,true);
        });
    });
    const localArtifactProvider = new ArtifactProvider();
    vscode.window.registerTreeDataProvider("galasa-artifacts", localArtifactProvider);
    vscode.commands.registerCommand("galasa-ras.delete", (run : LocalRun) => {
        rimraf(run.runPath, () => {});
        localRasProvider.refresh();
    });
    vscode.commands.registerCommand("galasa-artifacts.open", (artifact : ArtifactItem) => {
        if(activeLabel != artifact.label) {
            activeLabel = artifact.label;
        } else {
            if (!fs.statSync(artifact.artifactPath).isDirectory()) {
                activeLabel = "";
                if (artifact.label.endsWith(".gz")) { // GALASA TERMINAL SCREEN
                    new TerminalView(fs.readFileSync(artifact.artifactPath), undefined);
                } else {
                    vscode.workspace.openTextDocument(artifact.artifactPath).then(doc => {
                            vscode.window.showTextDocument(doc,vscode.ViewColumn.Active,true);
                    });
                }
            }
        }
    });
    vscode.commands.registerCommand("galasa-ras.overview", (run : LocalRun) => {
        if(activeLabel != run.label) {
            activeLabel = run.label;
        } else {
            activeLabel = "";
            localArtifactProvider.setRun(run);
            showOverview(run);
        }
    });

    //Debugger JSON
    const provider = new GalasaConfigurationProvider(galasaPath, context, environmentProvider); 
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('galasa', provider));
}