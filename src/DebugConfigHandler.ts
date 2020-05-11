import { DebugConfiguration, workspace, ExtensionContext, window, tasks, Task, TaskScope, ShellExecution } from 'vscode';
import { TestCase } from './TestExtractor';
import * as fs from 'fs';
import * as vscode from "vscode";
import rimraf = require('rimraf');
var path = require('path');

export async function getDebugConfig(testClass : TestCase, context : ExtensionContext) : Promise<DebugConfiguration> {
    let maven = "";
    let localMaven : string | undefined = workspace.getConfiguration("galasa").get("maven-local");
    if(localMaven && localMaven.trim().length != 0) {
        maven = maven + "--localmaven file:" + workspace.getConfiguration("galasa").get("maven-local") + " ";
    }
    let remoteMaven : string | undefined = workspace.getConfiguration("galasa").get("maven-remote");
    if(remoteMaven && remoteMaven.trim().length != 0) {
        maven = maven + "--remotemaven " + workspace.getConfiguration("galasa").get("maven-remote") + " ";
    }

    const workspaceObr = await buildLocalObr(context);

    await tasks.executeTask(getBuildWorkspaceObrTask(context));
    
    return {
        name: "Galasa Debug",
        type: "java",
        request: "launch",
        classPaths: [context.extensionPath + "/lib/galasa-boot.jar"],
        mainClass: "dev.galasa.boot.Launcher",
        args: maven + "--obr mvn:dev.galasa/dev.galasa.uber.obr/" + getGalasaVersion() + "/obr " + workspaceObr + "--test " + findTestArtifact(testClass)
    }
}

export function getGalasaVersion() : string {
    let version : string | undefined = workspace.getConfiguration("galasa").get("version");
    if(!version || version == "LATEST") {
        version = "0.7.0";
    }
    
    return version;
}

export function getRemoteEndPoint() : string {
    let remoteEndpoint : string | undefined = workspace.getConfiguration("galasa").get("remoteTest");
    if(!remoteEndpoint || remoteEndpoint == "") {
        remoteEndpoint = "";
        vscode.window.showErrorMessage("You have not set up your settings properly for running a remote test.")
    }
    
    return remoteEndpoint;
}

export async function buildLocalObr(context : ExtensionContext) : Promise<string> {
    let pomData = fs.readFileSync(context.extensionPath +"/lib/obr-pom.xml").toString();
    let dependencies = "";

    const manifests = await workspace.findFiles("**/MANIFEST.MF");
    manifests.forEach(file => {
        const bundleName = findPomField(file.toString().replace("%40", "@").replace("file://", ""), "artifactId");
        const groupName = findPomField(file.toString().replace("%40", "@").replace("file://", ""), "groupId");
        const version = findPomField(file.toString().replace("%40", "@").replace("file://", ""), "version");
        dependencies = dependencies + "<dependency><groupId>" + groupName + "</groupId>" +
            "<artifactId>"+ bundleName +"</artifactId>" +
            "<version>"+ version + "</version>" +
            "<scope>compile</scope></dependency>\n"
    });
    let galasaVersion = getGalasaVersion();
    pomData = pomData.replace(/%%dependencies%%/g, dependencies).replace(/%%version%%/g, galasaVersion);

    if(!fs.existsSync(context.extensionPath + "/galasa-workspace-obr")) {
        fs.mkdirSync(context.extensionPath + "/galasa-workspace-obr");
    }
    fs.writeFileSync(context.extensionPath + "/galasa-workspace-obr/pom.xml", pomData);

    return "--obr mvn:dev.galasa/vscode.workspace.obr/" + galasaVersion + "/obr ";
}

export function findTestArtifact(testClass : TestCase) : string {
    const data : string = fs.readFileSync(testClass.pathToFile).toString();
    let packageName = data.substring(data.indexOf("package") + 8);
    packageName = packageName.substring(0, packageName.indexOf(";")).trim();

    const bundleName = findPomField(path.dirname(testClass.pathToFile), "artifactId");

    return bundleName + "/" + packageName + "." + testClass.label;

}

function findPomField(directory : string, field : string) : string {
    if(fs.statSync(directory).isDirectory()) {
        let pom = "";
        fs.readdirSync(directory).forEach(file => {
            if(file.includes("pom.xml")) {
                pom = file;
            }
        });
        if(pom != "") {
            let data = fs.readFileSync(directory + "/" + pom).toString();
            if((field == "artifactId" || field == "version")&& data.includes("<parent>")) {
                data = data.substring(data.indexOf("</parent>"));
            }
            data = data.substring(data.indexOf("<" + field + ">") + field.length + 2, data.indexOf("</"+ field +">"));
            return data;
        }
    }
    return findPomField(path.dirname(directory), field);
}

function getBuildWorkspaceObrTask(context : ExtensionContext) : Task {
    return new Task({type : "shell"}, TaskScope.Workspace.toString(), "Workspace Obr", new ShellExecution("mvn install -f " + context.extensionPath + "/galasa-workspace-obr/"));
}