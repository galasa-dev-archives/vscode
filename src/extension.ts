import * as vscode from 'vscode';
import { RASProvider } from './TreeViewResultArchiveStore';
const path = require('path');
const fs = require('fs');

export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('galasa.addEntry', () => {
        vscode.debug.startDebugging(undefined, "Galasa Debug");
    });
    vscode.commands.registerCommand('galasa.bootjar', config => {
        return context.extensionPath + "/lib/galasa-boot.jar";
    });
    vscode.commands.registerCommand('galasa.localmaven', config => {
        return "--localmaven file:" + vscode.workspace.getConfiguration("galasa").get("maven-local");
    });
    vscode.commands.registerCommand('galasa.remotemaven', config => {
        return "--remotemaven " + vscode.workspace.getConfiguration("galasa").get("maven-remote");
    });
    vscode.commands.registerCommand('galasa.version', config => {
        const version = vscode.workspace.getConfiguration("galasa").get("version");

        if (version === "LATEST") {
            return "0.7.0";
        } else {
            return version;
        }
    });
    vscode.commands.registerCommand('galasa.specifyTestClass', config => {
        const active = vscode.window.activeTextEditor;
        
        if(active) {
            let text = active.document.getText();
            let packageStart = text.substring(text.indexOf("package"));
            let packageName = packageStart.substring(8, packageStart.indexOf(';'));
            let testName = active.document.fileName.substring(active.document.fileName.lastIndexOf('/') + 1, active.document.fileName.lastIndexOf('.java'));
            return packageName + "/" + packageName + "." + testName;
        }
    });

    //RAS
    const rasProvider = new RASProvider(vscode.workspace.getConfiguration("galasa").get("path") + "");
    vscode.window.registerTreeDataProvider("galasa-ras", rasProvider);
    vscode.commands.registerCommand("galasa-ras.refresh", () => rasProvider.refresh());
    

    
}