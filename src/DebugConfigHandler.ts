import { DebugConfiguration, workspace, ExtensionContext, window, tasks, Task, TaskScope, ShellExecution } from 'vscode';
import { TestCase } from './TestExtractor';
import * as fs from 'fs';
import { EnvironmentProvider } from './TreeViewEnvironmentProperties';
var path = require('path');

export async function getDebugConfig(testClass : TestCase, galasaPath : string, context : ExtensionContext, environmentProvider : EnvironmentProvider) : Promise<DebugConfiguration> {
    let maven = "";
    let localMaven : string | undefined = workspace.getConfiguration("galasa").get("maven-local");
    if(localMaven && localMaven.trim().length != 0) {
        maven = maven + "--localmaven file:" + workspace.getConfiguration("galasa").get("maven-local") + " ";
    }
    let remoteMaven : string | undefined = workspace.getConfiguration("galasa").get("maven-remote");
    if(remoteMaven && remoteMaven.trim().length != 0) {
        maven = maven + "--remotemaven " + workspace.getConfiguration("galasa").get("maven-remote") + " ";
    }

    let bootstrap = workspace.getConfiguration("galasa").get("bootstrap");
    if(!bootstrap) {
        bootstrap = "file:" + galasaPath + "/bootstrap.properties";
    }
    const bootstrapURI = "--bootstrap " + bootstrap + " ";

    const overridesURI = buildOverrides(galasaPath, context, environmentProvider);

    const workspaceObr = await buildLocalObr(context);

    await tasks.executeTask(getBuildWorkspaceObrTask(context));
    
    return {
        name: "Galasa Debug",
        type: "java",
        request: "launch",
        classPaths: [context.extensionPath + "/lib/galasa-boot.jar"],
        mainClass: "dev.galasa.boot.Launcher",
        args: maven + "--obr mvn:dev.galasa/dev.galasa.uber.obr/" + getGalasaVersion(context) + "/obr " 
            + workspaceObr + bootstrapURI + overridesURI + "--test " + findTestArtifact(testClass)
    }
}

export function getGalasaVersion(context : ExtensionContext) : string  {
    let version : string | undefined = workspace.getConfiguration("galasa").get("version");
    if(!version || version == "LATEST") {
        version = JSON.parse(fs.readFileSync(context.extensionPath + "/package.json").toString()).version + "";
    }
    
    return version;
}

function buildOverrides(galasaPath : string, context : ExtensionContext, environmentProvider : EnvironmentProvider) : string {
    if(!fs.existsSync(context.extensionPath + "/galasa-workspace")) {
        fs.mkdirSync(context.extensionPath + "/galasa-workspace");
    }
    if(!fs.existsSync(context.extensionPath + "/galasa-workspace/overrides")) {
        fs.mkdirSync(context.extensionPath + "/galasa-workspace/overrides");
    }
    const filepath = context.extensionPath + "/galasa-workspace/overrides/generated_overrides.properties";
    const envPath = environmentProvider.getEnvironment();
    if(!envPath) {
        fs.writeFileSync(filepath, "");
    } else {
        const environmentPropContent = fs.readFileSync(envPath).toString();
        fs.writeFileSync(filepath, environmentPropContent);
    }
    
    fs.appendFileSync(filepath, "framework.resultarchive.store=file:" + galasaPath + "/ras\n");
    fs.appendFileSync(filepath, "framework.credentials.store=file:" + galasaPath + "/credentials.properties\n");

    let bootstrap = workspace.getConfiguration("galasa").get("bootstrap");
    if(!bootstrap) {
        bootstrap = "file:" + galasaPath + "/bootstrap.properties";
    }
    fs.appendFileSync(filepath, "framework.bootstrap.url=" + bootstrap + "\n");

    let requestor = workspace.getConfiguration("galasa").get("requestor");
    if(!requestor) {
        requestor = "unknown";
    }
    fs.appendFileSync(filepath, "framework.run.requestor=" + requestor + "\n");

    return "--overrides file:" + filepath + " ";
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
    let galasaVersion = getGalasaVersion(context);
    pomData = pomData.replace(/%%dependencies%%/g, dependencies).replace(/%%version%%/g, galasaVersion);

    if(!fs.existsSync(context.extensionPath + "/galasa-workspace")) {
        fs.mkdirSync(context.extensionPath + "/galasa-workspace");
    }
    if(!fs.existsSync(context.extensionPath + "/galasa-workspace/obr")) {
        fs.mkdirSync(context.extensionPath + "/galasa-workspace/obr");
    }
    fs.writeFileSync(context.extensionPath + "/galasa-workspace/obr/pom.xml", pomData);

    return "--obr file:" + context.extensionPath + "/galasa-workspace/obr/target/repository.obr ";
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
    return new Task({type : "shell"}, TaskScope.Workspace.toString(), "Workspace Obr", new ShellExecution("mvn install -f " + context.extensionPath + "/galasa-workspace/obr/"));
}