import { DebugConfiguration, workspace } from 'vscode';
import { TestCase } from './TestExtractor';
import * as fs from 'fs';
var path = require('path');

export async function getDebugConfig(bootUri : string, testClass : TestCase) : Promise<DebugConfiguration> {
    let maven = "";
    let localMaven : string | undefined = workspace.getConfiguration("galasa").get("maven-local");
    if(localMaven && localMaven.trim().length != 0) {
        maven = maven + "--localmaven file:" + workspace.getConfiguration("galasa").get("maven-local") + " ";
    }
    let remoteMaven : string | undefined = workspace.getConfiguration("galasa").get("maven-remote");
    if(remoteMaven && remoteMaven.trim().length != 0) {
        maven = maven + "--remotemaven " + workspace.getConfiguration("galasa").get("maven-remote") + " ";
    }
    
    return {
        name: "Galasa Debug",
        type: "java",
        request: "launch",
        classPaths: [bootUri],
        mainClass: "dev.galasa.boot.Launcher",
        args: maven + "--obr mvn:dev.galasa/dev.galasa.uber.obr/" + getGalasaVersion() + "/obr " + await findLocalObrs(testClass) + "--test " + findTestArtifact(testClass)
    }
}

export function getGalasaVersion() : string {
    let version : string | undefined = workspace.getConfiguration("galasa").get("version");
    if(!version || version == "LATEST") {
        version = "0.7.0";
    }
    
    return version;
}

export async function findLocalObrs(testCase : TestCase) : Promise<string> {
    let obrs : string[] = [];
    const pomFiles = await workspace.findFiles("**/pom.xml");
    pomFiles.forEach(file => {
        let fileName = file.toString().substring(7);
        if(fileName.includes("%40")) {
            fileName = fileName.replace("%40","@");
        }
        let data = fs.readFileSync(fileName).toString();

        let groupId = data.substring(data.indexOf("<groupId>") + 9, data.indexOf("</groupId>"));
        if(data.includes("<packaging>galasa-obr</packaging>")) {
            if(data.includes("<parent>")) {
                data = data.substring(data.indexOf("</parent>"))
            } else {
                groupId = data.substring(data.indexOf("<groupId>") + 9, data.indexOf("</groupId>"));
            }
            let version = data.substring(data.indexOf("<version>") + 9, data.indexOf("</version>"));
            data = data.substring(data.indexOf("<artifactId>") + 12, data.indexOf("</artifactId>"));
            obrs.push(groupId + "/" + data + "/" + version + "/obr");
        }
    });

    let obrString = "";
    obrs.forEach(obr => {
        obrString = obrString + "--obr mvn:" + obr + " ";
    });
    return obrString;
}

export function findTestArtifact(testClass : TestCase) : string {
    const data : string = fs.readFileSync(testClass.pathToFile).toString();
    let packageName = data.substring(data.indexOf("package") + 8);
    packageName = packageName.substring(0, packageName.indexOf(";")).trim();

    const bundleName = findBundleName(path.dirname(testClass.pathToFile));

    return bundleName + "/" + packageName + "." + testClass.label;

}

function findBundleName(directory : string) : string {
    if(fs.statSync(directory).isDirectory()) {
        let pom = "";
        fs.readdirSync(directory).forEach(file => {
            if(file.includes("pom.xml")) {
                pom = file;
            }
        });
        if(pom != "") {
            let data = fs.readFileSync(directory + "/" + pom).toString();
            if(data.includes("<parent>")) {
                data = data.substring(data.indexOf("</parent>"))
            }
            data = data.substring(data.indexOf("<artifactId>") + 12, data.indexOf("</artifactId>"));
            return data;
        }
    }
    return findBundleName(path.dirname(directory));
}