import * as vscode from "vscode";
import * as fs from 'fs';
import * as unzipper from "unzipper";
import * as rimraf from "rimraf";

export function launchSimbank(context : vscode.ExtensionContext) {
    let terminal = vscode.window.createTerminal("SimBank");
    terminal.show();
    terminal.sendText("java -jar " + context.extensionPath + "/lib/galasa-simplatform.jar");
}

export async function createExampleFiles(context : vscode.ExtensionContext) {
    let packageName = await vscode.window.showInputBox({ placeHolder: "Package Name" });
    if(packageName != undefined) {
        if(packageName == "") {
            packageName = "dev.galasa.simbank"
        }

        if(await exampleExists(packageName)) {
            vscode.window.showInformationMessage("Example code with package name '" + packageName +"' already exists");
        } else {
            await generateExampleCode(packageName, context);
        }
    }
}

async function exampleExists(packageName : string) : Promise<boolean> {
    let foundFiles = await vscode.workspace.findFiles("**/" + packageName + ".manager/**");
    foundFiles = foundFiles.concat(await vscode.workspace.findFiles("**/" + packageName + ".test/**"));
    return foundFiles.length > 0;
}

async function generateExampleCode(packageName : string, context : vscode.ExtensionContext) {
    let javaExt = vscode.extensions.getExtension("redhat.java");
    let enabledBuilding : boolean | undefined = false;
    if(javaExt) {
        let config = vscode.workspace.getConfiguration();
        if(config.has("java.autobuild.enabled")) {
            enabledBuilding = config.get("java.autobuild.enabled");
            config.update("java.autobuild.enabled", false);
        }
    }
    if(vscode.workspace.workspaceFolders) {
        let workpath = getWorkspacePath();
        if(workpath) {
            const fileContents = fs.createReadStream(context.extensionPath + "/lib/galasa-simbanktests-parent-examples.zip");
            fileContents.pipe(unzipper.Extract({ path: workpath }));

            let watcher = vscode.workspace.createFileSystemWatcher("**/dev.galasa.simbank.*");
            watcher.onDidCreate(async project => {
                try {
                    await Promise.resolve(() => setTimeout(() => {}, 100));
                    const exampleName = project.toString().substring(project.toString().lastIndexOf("/") + 1);
                    const projectName = exampleName.toString().replace("dev.galasa.simbank", packageName);
                    if(!fs.existsSync(workpath + "/" + projectName) && (exampleName == "dev.galasa.simbank.manager" || exampleName == "dev.galasa.simbank.tests")) {
                        copyDirectory(workpath + "/examples/" + exampleName, workpath + "/" + projectName)

                        let pomData = fs.readFileSync(workpath + "/" + projectName + "/pom-example.xml").toString();
                        pomData = pomData.replace(/%%prefix%%/g, packageName);
                        fs.writeFileSync(workpath + "/" + projectName + "/pom-example.xml", pomData);
                        fs.renameSync(workpath + "/" + projectName + "/pom-example.xml", workpath + "/" + projectName + "/pom.xml");

                        if(fs.existsSync(workpath + "/" + packageName + ".manager") && fs.existsSync(workpath + "/" + packageName + ".tests")) {
                            rimraf(workpath + "/examples", () => {});
                            watcher.dispose();
                        }
                    }
                } catch(err) {
                    vscode.window.showErrorMessage("Error loading example tests, please update the Galasa plugin and try again");
                    rimraf(workpath + "/" + packageName + ".manager", () => {});
                    rimraf(workpath + "/" + packageName + ".tests", () => {});
                    rimraf(workpath + "/examples", () => {});
                } finally {
                    if(javaExt) {
                        let config = vscode.workspace.getConfiguration();
                        if(config.has("java.autobuild.enabled")) {
                            config.update("java.autobuild.enabled", enabledBuilding);
                        }
                    }
                }
            });
        }
    }
}

export function getWorkspacePath() : string | undefined {
    let workspacePath : string | undefined = undefined;
    vscode.workspace.workspaceFolders?.forEach(folder => {
        if(!workspacePath) {
            workspacePath = folder.uri.toString().replace("%40","@").replace("file://", "");
        }
    });
    return workspacePath;
}

function copyDirectory(source : string, target : string) {
    fs.mkdirSync(target);
    fs.readdirSync(source).forEach(file => {
        if(fs.statSync(source + "/" + file).isFile()) {
            fs.copyFileSync(source + "/" + file, target + "/" + file);
        } else {
            copyDirectory(source + "/" + file, target + "/" + file);
        }
    });
}