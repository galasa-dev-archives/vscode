import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EnvironmentProvider, Property } from './TreeViewEnvironmentProperties';
import rimraf = require('rimraf');

export async function selectEnvrionment(galasaPath : string, environmentProvider : EnvironmentProvider) {
    let files : string[] = [];
    fs.readdirSync(path.join(galasaPath, "vscode")).forEach(file => {
        if(file.endsWith(".properties")) {
            const name = fs.readFileSync(path.join(galasaPath, "vscode", file)).toString().split(/\r?\n/)[0].replace("#", "")
            files.push(name);
        }
    });
    files.push("Create New Environment");
    const chosen = await vscode.window.showQuickPick(files, {placeHolder : "Environment Properties"});
    if(chosen == "Create New Environment") {
        const newName = await vscode.window.showInputBox({placeHolder : "Galasa Environment Name"});
        if(!newName) {
            return;
        }
        const newFileName = newName.replace(/[^A-Za-z0-9_-]/g, "") + ".properties";
        if(newName == "Create New Environment") {
            vscode.window.showWarningMessage("Invalid New Galasa Environment Name");
            return;
        } else if(fs.existsSync(path.join(galasaPath, "vscode", newFileName))) {
            vscode.window.showWarningMessage("New Galasa Environment Name already exists or is too similar");
            return;
        }
        fs.writeFileSync(path.join(galasaPath, "vscode", newFileName), "#" + newName + "\n");
        environmentProvider.setEnvironment(path.join(galasaPath, "vscode", newFileName));
    } else if(chosen) {
        const filename = chosen.replace(/[^A-Za-z0-9_-]/g, "") + ".properties";
        environmentProvider.setEnvironment(path.join(galasaPath, "vscode", filename));
    }
}

export async function addProperty(environmentProvider : EnvironmentProvider) {
    const envPath = environmentProvider.getEnvironment();
    if(!envPath) {
        vscode.window.showWarningMessage("No Galasa Environment Selected");
        return;
    }
    let properties = new Map<string, string>();
    fs.readFileSync(envPath).toString().split(/\r?\n/).forEach(line => {
        if(!line.startsWith("#") && line != "") {
            const pairing = line.split("=");
            properties.set(pairing[0], pairing[1]);
        }
    });
    const propName = await vscode.window.showInputBox({placeHolder : "Property Name"});
    if(!propName) {
        return;
    }
    if(properties.has(propName)) {
        vscode.window.showWarningMessage("Property already exists");
        return;
    }
    const propValue = await vscode.window.showInputBox({placeHolder : "Property Value"});
    if(!propValue) {
        return;
    }
    fs.appendFileSync(envPath, propName + "=" + propValue + "\n");
    environmentProvider.refresh();
}

export async function deleteEnvironment(galasaPath : string, environmentProvider : EnvironmentProvider) {
    let files : string[] = [];
    fs.readdirSync(path.join(galasaPath, "vscode")).forEach(file => {
        if(file.endsWith(".properties")) {
            const name = fs.readFileSync(path.join(galasaPath, "vscode", file)).toString().split(/\r?\n/)[0].replace("#", "")
            files.push(name);
        }
    });
    if(files.length == 0) {
        vscode.window.showWarningMessage("There are no saved Environments");
        return;
    }
    const chosen = await vscode.window.showQuickPick(files, {placeHolder : "Environment to be Deleted"});
    if(!chosen) {
        return;
    }
    if(environmentProvider.getEnvironment() == path.join(galasaPath, "vscode", chosen.replace(/[^A-Za-z0-9_-]/g, "") + ".properties")) {
        environmentProvider.setEnvironment(undefined);
        fs.writeFileSync(path.join(galasaPath, "vscode", "envconfig"), "");
    }
    rimraf(path.join(galasaPath, "vscode", chosen.replace(/[^A-Za-z0-9_-]/g, "") + ".properties"), () => {});
}

export async function editProperty(property : Property, environmentProvider : EnvironmentProvider) {
    const envPath = environmentProvider.getEnvironment();
    if(!envPath) {
        vscode.window.showWarningMessage("No Galasa Environment Selected");
        return;
    }
    const newPropValue = await vscode.window.showInputBox({placeHolder : "New Property Value"});
    const fileContent = fs.readFileSync(envPath).toString().replace(property.key + "=" + property.value, property.key + "=" + newPropValue);
    fs.writeFileSync(envPath, fileContent);
    environmentProvider.refresh();
}

export function deleteProperty(property : Property, environmentProvider : EnvironmentProvider) {
    const envPath = environmentProvider.getEnvironment();
    if(!envPath) {
        vscode.window.showWarningMessage("No Galasa Environment Selected");
        return;
    }
    const fileContent = fs.readFileSync(envPath).toString().replace(property.key + "=" + property.value + "\n", "");
    fs.writeFileSync(envPath, fileContent);
    environmentProvider.refresh();
}