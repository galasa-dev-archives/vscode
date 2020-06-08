import * as vscode from 'vscode';
import { TestCase } from './TestExtractor';
import { RASProvider, LocalRun} from './TreeViewLocalResultArchiveStore';
import { getDebugConfig, findTestArtifact, getGalasaVersion } from './DebugConfigHandler';
import { TerminalView } from "./ui/TerminalView";
import * as fs from 'fs';
import * as path from 'path';
import { createExampleFiles, launchSimbank } from './Examples';
import { ArtifactProvider, ArtifactItem } from './TreeViewArtifacts';
import rimraf = require('rimraf');
import { EnvironmentProvider, GalasaEnvironment } from './TreeViewEnvironmentProperties';
import { showOverview } from './ui/RunOverview';
import {CodeProvider} from "./CodeProvider";
import { GalasaConfigurationProvider } from "./debugger/GalasaConfigurationProvider";
import commentjson = require('comment-json');
import { addEnvrionment, deleteEnvironment } from './EnvironmentController';
const galasaPath = path.join(process.env.HOME ? process.env.HOME : "", ".galasa");

export function activate(context: vscode.ExtensionContext) {

    setupWorkspace();

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
            if (activeDoc.document.getText().includes("@Test") && activeDoc.document.getText().includes("import dev.galasa.Test;") && activeDoc.document.uri.fsPath.endsWith(".java")) {
                if (vscode.workspace.workspaceFolders) {
                    const launchPath = path.join(vscode.workspace.workspaceFolders[0]?.uri.fsPath, ".vscode", "launch.json");
                    let testcase;
                    let filename = activeDoc.document.fileName;
                    if (activeDoc.document.uri.fsPath.lastIndexOf("/") != -1) {
                        testcase = new TestCase(filename.substring(filename.lastIndexOf("/") + 1, filename.lastIndexOf(".java")), activeDoc.document.uri.fsPath);
                    } else {
                        testcase = new TestCase(filename.substring(filename.lastIndexOf("\\") + 1, filename.lastIndexOf(".java")), activeDoc.document.uri.fsPath);
                    }
                    if(!fs.existsSync(launchPath)) {
                        if (!fs.existsSync(path.join(vscode.workspace.workspaceFolders[0]?.uri.fsPath, ".vscode"))) {
                            fs.mkdirSync(path.join(vscode.workspace.workspaceFolders[0]?.uri.fsPath, ".vscode"));
                        }
                        let launch: any = `{
                            "version": "0.2.0",
                            "configurations": []
                        }`;
                        fs.writeFileSync(launchPath, JSON.stringify(JSON.parse(launch), undefined, 4));
                    }
                    
                    let launch = commentjson.parse(fs.readFileSync(launchPath).toString());
                    let config = JSON.parse(fs.readFileSync(path.join(context.extensionPath, "package.json")).toString()).contributes.debuggers[0].initialConfigurations[0];
                    config.testclass = findTestArtifact(testcase);
                    config.name = testcase.label;
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
        environmentProvider.setEnvironment(env.path);
    });
    vscode.commands.registerCommand("galasa-environment.open", (env : GalasaEnvironment) => {
        if(activeLabel != env.label) {
            activeLabel = env.label;
        } else {
            activeLabel = "";
            vscode.workspace.openTextDocument(env.path).then(doc => {
                vscode.window.showTextDocument(doc,vscode.ViewColumn.Active,true);
            });
        }
    });

    //Local Runs
    const localRasProvider = new RASProvider(galasaPath);
    vscode.window.registerTreeDataProvider("galasa-ras", localRasProvider);
    vscode.commands.registerCommand("galasa-ras.refresh", () => localRasProvider.refresh());
    vscode.commands.registerCommand('galasa-ras.runlog', (run : LocalRun) => {
        vscode.workspace.openTextDocument(path.join(run.path, "run.log")).then(doc => {
            vscode.window.showTextDocument(doc,vscode.ViewColumn.Active,true);
        });
    });
    const localArtifactProvider = new ArtifactProvider();
    vscode.window.registerTreeDataProvider("galasa-artifacts", localArtifactProvider);
    vscode.commands.registerCommand("galasa-ras.delete", (run : LocalRun) => {
        rimraf(run.path, () => {});
        localRasProvider.refresh();
    });
    vscode.commands.registerCommand("galasa-artifacts.open", (artifact : ArtifactItem) => {
        if(activeLabel != artifact.label) {
            activeLabel = artifact.label;
        } else {
            if (!fs.statSync(artifact.path).isDirectory()) {
                activeLabel = "";
                if (artifact.label.endsWith(".gz")) { // GALASA TERMINAL SCREEN
                    new TerminalView(fs.readFileSync(artifact.path), undefined);
                } else {
                    vscode.workspace.openTextDocument(artifact.path).then(doc => {
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

function setupWorkspace() : string[] {
    let created : string[] = []
    if(!fs.existsSync(path.join(galasaPath, "credentials.properties"))) {
        fs.writeFile(path.join(galasaPath, "credentials.properties"), "", function (err) {
            if (err) throw err;
        });
        created.push("credentials.properties");
    }
    if(!fs.existsSync(path.join(galasaPath, "cps.properties"))) {
        fs.writeFile(path.join(galasaPath, "cps.properties"), "", function (err) {
            if (err) throw err;
        });
        created.push("cps.properties");
    }
    if(!fs.existsSync(path.join(galasaPath, "bootstrap.properties"))) {
        fs.writeFile(path.join(galasaPath, "bootstrap.properties"), "", function (err) {
            if (err) throw err;
        });
        created.push("bootstrap.properties");
    }
    if(!fs.existsSync(path.join(galasaPath, "dss.properties"))) {
        fs.writeFile(path.join(galasaPath, "dss.properties"), "", function (err) {
            if (err) throw err;
        });
        created.push("dss.properties");
    }
    if(!fs.existsSync(path.join(galasaPath, "overrides.properties"))) {
        fs.writeFile(path.join(galasaPath, "overrides.properties"), "", function (err) {
            if (err) throw err;
        });
        created.push("overrides.properties");
    }
    if(!fs.existsSync(path.join(galasaPath, "vscode"))) {
        fs.mkdirSync(path.join(galasaPath, "vscode"));
        created.push("vscode");
    }
    return created;
}