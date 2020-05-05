import { DebugConfiguration, workspace } from 'vscode';
import { TestCase } from './TestExtractor';
import * as fs from 'fs';
var path = require('path');

export function getDebugConfig(bootUri : string, localMaven : string | undefined, remoteMaven : string | undefined, testClass : TestCase) : DebugConfiguration {
    let maven = "";
    if(localMaven && localMaven.trim().length != 0) {
        maven = maven + "--localmaven file:" + workspace.getConfiguration("galasa").get("maven-local") + " ";
    }
    if(remoteMaven && remoteMaven.trim().length != 0) {
        maven = maven + "--remotemaven " + workspace.getConfiguration("galasa").get("maven-remote") + " ";
    }

    let version = workspace.getConfiguration("galasa").get("version");
    if (version == "LATEST") {
        version = "0.7.0";
    }
    
    return {
        name: "Galasa Debug",
        type: "java",
        request: "launch",
        classPaths: [bootUri],
        mainClass: "dev.galasa.boot.Launcher",
        args: maven + "--obr mvn:dev.galasa/dev.galasa.uber.obr/" + version + "/obr --test " + findTestArtifact(testClass)
    }
}

export function findTestArtifact(testClass : TestCase) : string {
    const data : string = fs.readFileSync(testClass.pathToFile).toString();
    let packageName = data.substring(data.indexOf("package") + 8);
    packageName = packageName.substring(0, packageName.indexOf(";")).trim();

    const bundleName = findBundleName(path.dirname(testClass.pathToFile));

    return bundleName + "/" + packageName + "." + testClass.label;

}

function findBundleName(directory : string) : string {
    console.log(directory);
    console.log(fs.statSync(directory).isDirectory());
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