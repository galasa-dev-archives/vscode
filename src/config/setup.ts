import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export async function setupWorkspace(context: vscode.ExtensionContext, galasaPath : string) {
    if(!fs.existsSync(path.join(galasaPath, "credentials.properties"))) {
        fs.writeFileSync(path.join(galasaPath, "credentials.properties"), "");
    }
    if(!fs.existsSync(path.join(galasaPath, "cps.properties"))) {
        fs.writeFileSync(path.join(galasaPath, "cps.properties"), "");
    }
    if(!fs.existsSync(path.join(galasaPath, "bootstrap.properties"))) {
        fs.writeFileSync(path.join(galasaPath, "bootstrap.properties"), "");
    }
    if(!fs.existsSync(path.join(galasaPath, "dss.properties"))) {
        fs.writeFileSync(path.join(galasaPath, "dss.properties"), "");
    }
    if(!fs.existsSync(path.join(galasaPath, "overrides.properties"))) {
        fs.writeFileSync(path.join(galasaPath, "overrides.properties"), "");
    }
    if(!fs.existsSync(path.join(galasaPath, "vscode"))) {
        fs.mkdirSync(path.join(galasaPath, "vscode"));
    }
    let cpsGalasaPath = path.join(galasaPath, "cps_snippets.json");
    let cpsExtensionPath = path.join(context.extensionPath, "galasa-workspace", "cps");
    if(fs.existsSync(cpsGalasaPath)) {
        if(!fs.existsSync(cpsExtensionPath)) {
            fs.mkdirSync(cpsExtensionPath);
        }
        if(fs.readFileSync(cpsGalasaPath).toString() != fs.readFileSync(path.join(cpsExtensionPath, "snippets.json")).toString()) {
            fs.writeFileSync(path.join(cpsExtensionPath, "snippets.json"), fs.readFileSync(cpsGalasaPath));
            let reload = await vscode.window.showInformationMessage("Changes were detected to your Galasa snippets. Do you want to reload the window now?", "Reload");
            if (reload == "Reload") {
                vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
        }
    }
}