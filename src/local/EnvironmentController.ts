import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EnvironmentProvider, GalasaEnvironment } from './views/TreeViewEnvironmentProperties';

export async function addEnvrionment(galasaPath : string, environmentProvider : EnvironmentProvider) {
    const newName = await vscode.window.showInputBox({placeHolder : "Galasa Environment Name"});
    if(!newName) {
        return;
    }
    const newFileName = newName.replace(/[^A-Za-z0-9_-]/g, "") + ".galenv";
    if(fs.existsSync(path.join(galasaPath, "vscode", newFileName))) {
        vscode.window.showWarningMessage("New Galasa Environment Name already exists or is too similar");
        return;
    }
    fs.writeFileSync(path.join(galasaPath, "vscode", newFileName), "#" + newName + "\n");
    environmentProvider.setEnvironment(path.join(galasaPath, "vscode", newFileName));
}

export async function deleteEnvironment(env : GalasaEnvironment, environmentProvider : EnvironmentProvider) {
    if(environmentProvider.getEnvironment() == env.envPath) {
        environmentProvider.setEnvironment(undefined);
    }
    fs.unlinkSync(env.envPath);
    environmentProvider.refresh();
}